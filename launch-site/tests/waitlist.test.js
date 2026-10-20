import { test, expect } from 'bun:test';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
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

test('local API reports local storage and bounds request bytes before signup', async () => {
  const site = createSite({ port: 0, database: ':memory:' });
  const origin = String(site.server.url).replace(/\/$/, '');
  const post = body => fetch(new URL('/api/waitlist', site.server.url), {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body
  });
  try {
    const response = await post(JSON.stringify({ email: 'fixture@example.invalid', interest: 'follow', consent: true }));
    expect((await response.json()).storage).toBe('local');
    expect((await post(JSON.stringify({ website: 'x'.repeat(3000) }))).status).toBe(413);
    const bytes = new TextEncoder().encode(JSON.stringify({ website: '€'.repeat(800) }));
    const stream = new ReadableStream({ start(controller) {
      controller.enqueue(bytes.slice(0, 1000)); controller.enqueue(bytes.slice(1000)); controller.close();
    } });
    expect((await post(stream)).status).toBe(413);
  } finally { site.close(); }
});

test('local static routing accepts HEAD and rejects traversal-shaped chunk names', async () => {
  const site = createSite({ port: 0, database: ':memory:' });
  try {
    const response = await fetch(new URL('/', site.server.url), { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await response.text()).toBe('');
    expect((await fetch(new URL('/chunk-bogus.js', site.server.url))).status).toBe(503);
    expect((await fetch(new URL('/chunk-..%2Fsrc%2Fserver.js', site.server.url))).status).toBe(404);
    expect((await fetch(new URL('/src/server.js', site.server.url))).status).toBe(404);
  } finally { site.close(); }
});


test('local static server serves controlled split chunks from dist', async () => {
  const directory = new URL('../dist/', import.meta.url);
  mkdirSync(directory, { recursive: true });
  const names = [`pavilion-test-${crypto.randomUUID()}.js`, `chunk-test-${crypto.randomUUID()}.js`];
  for (const name of names) writeFileSync(new URL(name, directory), 'export const fixture = true;');
  const site = createSite({ port: 0, database: ':memory:' });
  try {
    for (const name of names) {
      const response = await fetch(new URL(`/${name}`, site.server.url));
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
      expect(await response.text()).toBe('export const fixture = true;');
    }
    expect((await fetch(new URL('/pavilion-..%2Fsrc%2Fserver.js', site.server.url))).status).toBe(404);
  } finally {
    site.close();
    for (const name of names) unlinkSync(new URL(name, directory));
  }
});
