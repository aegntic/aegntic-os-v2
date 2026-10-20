const rates = new Map();

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
};

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...securityHeaders,
      'Cache-Control': 'no-store'
    }
  });
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // Serve static assets for GET/HEAD
      if (request.method === 'GET' || request.method === 'HEAD') {
        const res = await env.ASSETS.fetch(request);
        const headers = new Headers(res.headers);
        for (const [k, v] of Object.entries(securityHeaders)) {
          headers.set(k, v);
        }
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers
        });
      }

      if (request.method !== 'POST' || !['/api/waitlist', '/api/waitlist/remove'].includes(url.pathname)) {
        return json({ error: 'Not found.' }, 404);
      }

      if (
        request.headers.get('origin') !== url.origin ||
        !request.headers.get('content-type')?.startsWith('application/json')
      ) {
        return json({ error: 'Same-origin JSON required.' }, 403);
      }

      const ip = request.headers.get('cf-connecting-ip') || 'edge';
      const now = Date.now();
      for (const [key, value] of rates) {
        if (value.until <= now) rates.delete(key);
      }
      const rate = rates.get(ip) || { count: 0, until: now + 600_000 };
      if (++rate.count > 12 || rates.size > 10000) {
        return json({ error: 'Try again later.' }, 429);
      }
      rates.set(ip, rate);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON.' }, 400);
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json({ error: 'Invalid request.' }, 400);
      }

      if (url.pathname.endsWith('/remove')) {
        if (typeof body.code !== 'string' || !/^[a-f0-9]{48}$/.test(body.code)) {
          return json({ error: 'Invalid removal code.' }, 400);
        }
        const removalHash = await sha256Hex(body.code);
        await env.DB.prepare('DELETE FROM signups WHERE removal_hash = ?1').bind(removalHash).run();
        return json({ ok: true });
      }

      // Honeypot check
      if (typeof body.website === 'string' && body.website) {
        return json({ ok: true });
      }

      if (
        typeof body.email !== 'string' ||
        body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
        body.consent !== true ||
        !['follow', 'build', 'both'].includes(body.interest)
      ) {
        return json({ error: 'Email, interest and consent required.' }, 400);
      }

      const code = randomHex(24);
      const removalHash = await sha256Hex(code);
      const email = body.email.trim().toLowerCase();
      const result = await env.DB.prepare(
        'INSERT OR IGNORE INTO signups(email, interest, consent_at, removal_hash) VALUES(?1, ?2, ?3, ?4)'
      )
        .bind(email, body.interest, new Date().toISOString(), removalHash)
        .run();

      const inserted = (result?.meta?.changes ?? 0) > 0;
      return json({ ok: true, ...(inserted ? { removalCode: code } : {}) }, 200);
    } catch {
      return json({ error: 'Could not save. Please try again.' }, 500);
    }
  }
};
