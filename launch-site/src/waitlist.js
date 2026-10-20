// Shared HTTP contract; adapters own persistence and request throttling.
export const BODY_LIMIT = 2048;
export const RATE_LIMIT = 12;
export const RATE_WINDOW = 600_000;
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
};
export function json(body, status = 200) {
  return Response.json(body, { status, headers: { ...securityHeaders, 'Cache-Control': 'no-store' } });
}
export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return hex(new Uint8Array(digest));
}
function hex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
function removalCode() {
  return hex(crypto.getRandomValues(new Uint8Array(24)));
}
class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
async function readBody(request) {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null && Number(declaredLength) > BODY_LIMIT) {
    throw new InputError('Request is too large.', 413);
  }
  const reader = request.body?.getReader();
  const chunks = [];
  let length = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > BODY_LIMIT) {
          // Do not wait for a potentially endless upstream body to finish.
          void reader.cancel().catch(() => {});
          throw new InputError('Request is too large.', 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new InputError('Invalid JSON.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InputError('Invalid request.');
  return body;
}
export async function handleWaitlist(request, adapter, ip) {
  const url = new URL(request.url);
  if (request.method !== 'POST' || !['/api/waitlist', '/api/waitlist/remove'].includes(url.pathname)) {
    return json({ error: 'Not found.' }, 404);
  }
  if (request.headers.get('origin') !== url.origin ||
      request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Same-origin JSON required.' }, 403);
  }
  if (!adapter) return json({ error: 'Signup storage is unavailable. Please try again later.' }, 503);
  try {
    if (!await adapter.allow(ip, Date.now())) return json({ error: 'Try again later.' }, 429);
    const body = await readBody(request);
    if (url.pathname.endsWith('/remove')) {
      if (typeof body.code !== 'string' || !/^[a-f0-9]{48}$/.test(body.code)) throw new InputError('Invalid removal code.');
      await adapter.remove(await sha256Hex(body.code));
      return json({ ok: true, storage: adapter.storage });
    }
    if (typeof body.website === 'string' && body.website) return json({ ok: true, storage: adapter.storage });
    if (typeof body.email !== 'string' || body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || body.consent !== true ||
        !['follow', 'build', 'both'].includes(body.interest)) {
      throw new InputError('Email, interest and consent required.');
    }
    const code = removalCode();
    const inserted = await adapter.insert({
      email: body.email.trim().toLowerCase(), interest: body.interest,
      consentAt: new Date().toISOString(), removalHash: await sha256Hex(code)
    });
    return json({ ok: true, storage: adapter.storage, ...(inserted ? { removalCode: code } : {}) });
  } catch (error) {
    if (error instanceof InputError) return json({ error: error.message }, error.status);
    return json({ error: 'Could not save. Please try again.' }, adapter.failureStatus || 500);
  }
}
