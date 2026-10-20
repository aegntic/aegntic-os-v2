import { Database } from 'bun:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

const root = resolve(import.meta.dir, '..');
const hash = value => createHash('sha256').update(value).digest('hex');
export function createSite({ port = 4320, database = resolve(root, '.data/waitlist.db') } = {}) {
  if (database !== ':memory:') mkdirSync(dirname(database), { recursive: true, mode: 0o700 });
  const db = new Database(database, { create: true });
  if (database !== ':memory:') chmodSync(database, 0o600);
  db.exec('CREATE TABLE IF NOT EXISTS signups(email TEXT PRIMARY KEY, interest TEXT NOT NULL, consent_at TEXT NOT NULL, removal_hash TEXT UNIQUE NOT NULL)');
  const rates = new Map();
  const files = { '/': ['public/index.html', 'text/html'], '/style.css': ['public/style.css', 'text/css'], '/client.js': ['dist/client.js', 'text/javascript'], '/mark.webp': ['public/mark.webp', 'image/webp'], '/assets/ae-logo.png': ['public/assets/ae-logo.png', 'image/png'], '/social/assembly-landscape.svg': ['public/social/assembly-landscape.svg', 'image/svg+xml'], '/social/assembly-square.svg': ['public/social/assembly-square.svg', 'image/svg+xml'], '/social/assembly-portrait.svg': ['public/social/assembly-portrait.svg', 'image/svg+xml'], '/social/assembly-vertical.svg': ['public/social/assembly-vertical.svg', 'image/svg+xml'] };
  for (const name of ['landscape', 'square', 'portrait', 'vertical']) files[`/social/assembly-${name}.png`] = [`public/social/assembly-${name}.png`, 'image/png'];
  const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" };
  const json = (body, status = 200) => Response.json(body, { status, headers });
  const server = Bun.serve({ hostname: '127.0.0.1', port, maxRequestBodySize: 2048, async fetch(request, server) {
    try {
      const url = new URL(request.url);
      if (request.method === 'GET' && files[url.pathname]) {
        const [path, type] = files[url.pathname]; const file = Bun.file(resolve(root, path));
        if (!await file.exists()) return json({ error: 'Build assets first with bun run build.' }, 503);
        return new Response(file, { headers: { ...headers, 'Content-Type': `${type}; charset=utf-8` } });
      }
      if (request.method !== 'POST' || !['/api/waitlist', '/api/waitlist/remove'].includes(url.pathname)) return json({ error: 'Not found.' }, 404);
      if (request.headers.get('origin') !== url.origin || !request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Same-origin JSON required.' }, 403);
      const ip = server.requestIP(request)?.address || 'local'; const now = Date.now();
      for (const [key, value] of rates) if (value.until <= now) rates.delete(key);
      const rate = rates.get(ip) || { count: 0, until: now + 600_000 };
      if (++rate.count > 12 || rates.size > 10000) return json({ error: 'Try again later.' }, 429);
      rates.set(ip, rate);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request.' }, 400);
      if (url.pathname.endsWith('/remove')) {
        if (typeof body.code !== 'string' || !/^[a-f0-9]{48}$/.test(body.code)) return json({ error: 'Invalid removal code.' }, 400);
        db.query('DELETE FROM signups WHERE removal_hash = ?').run(hash(body.code)); return json({ ok: true });
      }
      if (typeof body.website === 'string' && body.website) return json({ ok: true });
      if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || body.consent !== true || !['follow', 'build', 'both'].includes(body.interest)) return json({ error: 'Email, interest and consent required.' }, 400);
      const code = randomBytes(24).toString('hex');
      const result = db.query('INSERT OR IGNORE INTO signups(email,interest,consent_at,removal_hash) VALUES(?,?,?,?)').run(body.email.trim().toLowerCase(), body.interest, new Date().toISOString(), hash(code));
      return json({ ok: true, ...(result.changes ? { removalCode: code } : {}) }, 200);
    } catch { return json({ error: 'Could not save. Please try again.' }, 500); }
  } });
  return { server, close() { server.stop(true); db.close(); } };
}
if (import.meta.main) { const { server } = createSite({ port: Number(process.env.PORT || 4320) }); console.log(`Assembly review: ${server.url}`); }
