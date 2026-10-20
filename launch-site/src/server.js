import { Database } from 'bun:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { handleWaitlist, json, securityHeaders, RATE_LIMIT, RATE_WINDOW } from './waitlist.js';

const root = resolve(import.meta.dir, '..');
export function createSite({ port = 4320, database = resolve(root, '.data/waitlist.db') } = {}) {
  if (database !== ':memory:') mkdirSync(dirname(database), { recursive: true, mode: 0o700 });
  const db = new Database(database, { create: true });
  if (database !== ':memory:') chmodSync(database, 0o600);
  db.exec('CREATE TABLE IF NOT EXISTS signups(email TEXT PRIMARY KEY, interest TEXT NOT NULL, consent_at TEXT NOT NULL, removal_hash TEXT UNIQUE NOT NULL)');
  const rates = new Map();
  const adapter = {
    storage: 'local',
    allow(ip, now) {
      for (const [key, rate] of rates) if (rate.until <= now) rates.delete(key);
      const rate = rates.get(ip) || { count: 0, until: now + RATE_WINDOW };
      if (!rates.has(ip) && rates.size >= 10000) return false;
      rate.count++;
      rates.set(ip, rate);
      return rate.count <= RATE_LIMIT;
    },
    insert({ email, interest, consentAt, removalHash }) {
      return db.query('INSERT OR IGNORE INTO signups(email,interest,consent_at,removal_hash) VALUES(?,?,?,?)')
        .run(email, interest, consentAt, removalHash).changes > 0;
    },
    remove(removalHash) { db.query('DELETE FROM signups WHERE removal_hash = ?').run(removalHash); }
  };
  const files = { '/': ['public/index.html', 'text/html'], '/style.css': ['public/style.css', 'text/css'], '/client.js': ['dist/client.js', 'text/javascript'], '/mark.webp': ['public/mark.webp', 'image/webp'], '/assets/ae-logo.png': ['public/assets/ae-logo.png', 'image/png'], '/social/assembly-landscape.svg': ['public/social/assembly-landscape.svg', 'image/svg+xml'], '/social/assembly-square.svg': ['public/social/assembly-square.svg', 'image/svg+xml'], '/social/assembly-portrait.svg': ['public/social/assembly-portrait.svg', 'image/svg+xml'], '/social/assembly-vertical.svg': ['public/social/assembly-vertical.svg', 'image/svg+xml'] };
  for (const name of ['landscape', 'square', 'portrait', 'vertical']) files[`/social/assembly-${name}.png`] = [`public/social/assembly-${name}.png`, 'image/png'];
  for (const name of ['robots.txt', 'sitemap.xml', 'THREE-LICENSE.txt']) {
    const type = name.endsWith('.xml') ? 'application/xml' : 'text/plain';
    files[`/${name}`] = [`public/${name}`, type];
  }
  for (const name of ['landscape', 'square']) files[`/social/pavilion-${name}.png`] = [`public/social/pavilion-${name}.png`, 'image/png'];
  const headers = { ...securityHeaders, 'Cache-Control': 'no-store' };
  const server = Bun.serve({ hostname: '127.0.0.1', port, maxRequestBodySize: 2048, async fetch(request, server) {
    try {
      const url = new URL(request.url);
      const asset = files[url.pathname] || (/^\/(?:chunk|pavilion)-[a-zA-Z0-9_-]+\.js$/.test(url.pathname)
        ? [`dist/${url.pathname.slice(1)}`, 'text/javascript'] : null);
      if (['GET', 'HEAD'].includes(request.method) && asset) {
        const [path, type] = asset; const file = Bun.file(resolve(root, path));
        if (!await file.exists()) return json({ error: 'Build assets first with bun run build.' }, 503);
        return new Response(request.method === 'HEAD' ? null : file, { headers: { ...headers, 'Content-Type': `${type}; charset=utf-8` } });
      }
      return await handleWaitlist(request, adapter, server.requestIP(request)?.address || 'local');
    } catch { return json({ error: 'Could not save. Please try again.' }, 500); }
  } });
  return { server, close() { server.stop(true); db.close(); } };
}
if (import.meta.main) { const { server } = createSite({ port: Number(process.env.PORT || 4320) }); console.log(`Assembly review: ${server.url}`); }
