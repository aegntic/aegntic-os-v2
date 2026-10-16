import { test, expect } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSite } from '../src/server.js';
import { Database } from 'bun:sqlite';

test('signup requires origin and consent, persists once, and can be removed with its private code', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'assembly-test-')); const database = join(folder, 'waitlist.db');
  let site = createSite({ port: 0, database });
  const send = (path, data, origin = String(site.server.url).replace(/\/$/, '')) => fetch(new URL(path, site.server.url), { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const input = { email: ' Person@example.invalid ', interest: 'build', consent: true, website: '' };
  try {
    expect((await send('/api/waitlist', input, 'https://evil.invalid')).status).toBe(403);
    expect((await send('/api/waitlist', { ...input, consent: false })).status).toBe(400);
    const response = await send('/api/waitlist', input); expect(response.status).toBe(200);
    const { removalCode } = await response.json(); expect(removalCode).toHaveLength(48);
    expect((await (await send('/api/waitlist', input)).json()).removalCode).toBeUndefined();
    site.close(); site = createSite({ port: 0, database });
    const db = new Database(database, { readonly: true });
    expect(db.query('SELECT COUNT(*) as count FROM signups').get().count).toBe(1); db.close();
    expect((await send('/api/waitlist/remove', { code: removalCode })).status).toBe(200);
    const read = new Database(database, { readonly: true }); expect(read.query('SELECT COUNT(*) as count FROM signups').get().count).toBe(0); read.close();
  } finally { site.close(); rmSync(folder, { recursive: true, force: true }); }
});
test('mail-sink honeypot and rate limit do not admit subscribers', async () => {
  const site = createSite({ port: 0, database: ':memory:' });
  try {
    const post = () => fetch(new URL('/api/waitlist', site.server.url), { method: 'POST', headers: { Origin: String(site.server.url).replace(/\/$/, ''), 'Content-Type': 'application/json' }, body: JSON.stringify({ website: 'bot.invalid' }) });
    for (let i = 0; i < 12; i++) expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(429);
  } finally { site.close(); }
});
