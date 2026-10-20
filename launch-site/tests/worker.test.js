import { test, expect } from 'bun:test';
import { Database } from 'bun:sqlite';
import worker from '../src/worker.js';
import { BODY_LIMIT, RATE_WINDOW, sha256Hex } from '../src/waitlist.js';

const migration = await Bun.file(new URL('../migrations/0001_pavilion_waitlist.sql', import.meta.url)).text();
const input = { email: ' Person@example.invalid ', interest: 'both', consent: true, website: '' };

// Executes the Worker's SQL verbatim against real SQLite. This is a D1 API-shape
// adapter, not a SQL matcher; Cloudflare runtime/network behavior remains untested.
function fixture({ migrate = true } = {}) {
  const sqlite = new Database(':memory:');
  if (migrate) sqlite.exec(migration);
  const db = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async run() { return { success: true, meta: { changes: sqlite.query(sql).run(...values).changes } }; },
        async first() { return sqlite.query(sql).get(...values); }
      };
    }
  };
  return { sqlite, env: { DB: db } };
}
function request(body, { path = '/api/waitlist', origin = 'https://pavilion.invalid', headers = {}, raw = false } = {}) {
  return new Request(`https://pavilion.invalid${path}`, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers },
    body: raw ? body : JSON.stringify(body)
  });
}

test('Worker inserts normalized consent record once, hashes removal credential, and removes idempotently', async () => {
  const { sqlite, env } = fixture();
  try {
    const response = await worker.fetch(request(input), env);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body.storage).toBe('cloudflare-d1');
    expect(body.removalCode).toMatch(/^[a-f0-9]{48}$/);
    const saved = sqlite.query('SELECT * FROM pavilion_waitlist_signups').get();
    expect(saved.email).toBe('person@example.invalid');
    expect(saved.interest).toBe('both');
    expect(Number.isNaN(Date.parse(saved.consent_at))).toBe(false);
    expect(saved.removal_hash).toBe(await sha256Hex(body.removalCode));
    expect(JSON.stringify(saved)).not.toContain(body.removalCode);
    const duplicate = await worker.fetch(request({ ...input, email: 'PERSON@EXAMPLE.INVALID' }), env);
    expect((await duplicate.json()).removalCode).toBeUndefined();
    expect(sqlite.query('SELECT count(*) AS n FROM pavilion_waitlist_signups').get().n).toBe(1);
    for (let i = 0; i < 2; i++) {
      const removal = await worker.fetch(request({ code: body.removalCode }, { path: '/api/waitlist/remove' }), env);
      expect(await removal.json()).toEqual({ ok: true, storage: 'cloudflare-d1' });
    }
    expect(sqlite.query('SELECT count(*) AS n FROM pavilion_waitlist_signups').get().n).toBe(0);
  } finally { sqlite.close(); }
});

test('Worker rejects invalid inputs, origins, media types and JSON without storing records', async () => {
  const { sqlite, env } = fixture();
  try {
    const invalid = [null, [], { ...input, email: 'bad' }, { ...input, consent: false }, { ...input, interest: 'other' }];
    for (const body of invalid) expect((await worker.fetch(request(body), env)).status).toBe(400);
    expect((await worker.fetch(request('{', { raw: true }), env)).status).toBe(400);
    expect((await worker.fetch(request(input, { origin: 'https://evil.invalid' }), env)).status).toBe(403);
    expect((await worker.fetch(request(input, { headers: { 'Content-Type': 'application/jsonp' } }), env)).status).toBe(403);
    expect((await worker.fetch(request({ code: 'A'.repeat(48) }, { path: '/api/waitlist/remove' }), env)).status).toBe(400);
    expect((await worker.fetch(request({ website: 'bot.invalid' }), env)).status).toBe(200);
    expect(sqlite.query('SELECT count(*) AS n FROM pavilion_waitlist_signups').get().n).toBe(0);
  } finally { sqlite.close(); }
});

test('Worker caps declared and streamed bytes including multibyte bodies', async () => {
  const { sqlite, env } = fixture();
  try {
    expect((await worker.fetch(request(input, { headers: { 'Content-Length': String(BODY_LIMIT + 1) } }), env)).status).toBe(413);
    const payload = JSON.stringify({ ...input, website: '€'.repeat(800) });
    expect(payload.length).toBeLessThan(BODY_LIMIT);
    const stream = new ReadableStream({ start(controller) {
      const bytes = new TextEncoder().encode(payload);
      controller.enqueue(bytes.slice(0, 1000)); controller.enqueue(bytes.slice(1000)); controller.close();
    } });
    expect((await worker.fetch(request(stream, { raw: true }), env)).status).toBe(413);
    expect(sqlite.query('SELECT count(*) AS n FROM pavilion_waitlist_signups').get().n).toBe(0);
  } finally { sqlite.close(); }
});

test('Worker throttle survives handler recreation, atomically limits concurrency and resets after expiry', async () => {
  const { sqlite, env } = fixture();
  try {
    const responses = await Promise.all(Array.from({ length: 20 }, () => worker.fetch(request({ website: 'bot.invalid' }), env)));
    expect(responses.filter(response => response.status === 200)).toHaveLength(12);
    expect(responses.filter(response => response.status === 429)).toHaveLength(8);
    const fresh = (await import('../src/worker.js?isolated-test')).default;
    expect((await fresh.fetch(request(input), env)).status).toBe(429);
    const rate = sqlite.query('SELECT * FROM pavilion_waitlist_rates').get();
    expect(rate.ip_hash).toBe(await sha256Hex('192.0.2.1'));
    expect(rate.expires_at).toBeLessThanOrEqual(Date.now() + RATE_WINDOW);
    sqlite.query('UPDATE pavilion_waitlist_rates SET expires_at = ?').run(Date.now() - 1);
    expect((await fresh.fetch(request(input), env)).status).toBe(200);
    expect(sqlite.query('SELECT count FROM pavilion_waitlist_rates').get().count).toBe(1);
    expect((await fresh.fetch(request(input, { headers: { 'CF-Connecting-IP': '192.0.2.2' } }), env)).status).toBe(200);
  } finally { sqlite.close(); }
});

test('migration is additive and repeatable, preserving unrelated and legacy records', () => {
  const { sqlite } = fixture({ migrate: false });
  try {
    sqlite.exec("CREATE TABLE signups(email TEXT); INSERT INTO signups VALUES('legacy@example.invalid'); CREATE TABLE projects(id TEXT); INSERT INTO projects VALUES('fixture');");
    sqlite.exec(migration); sqlite.exec(migration);
    expect(sqlite.query('SELECT * FROM signups').all()).toEqual([{ email: 'legacy@example.invalid' }]);
    expect(sqlite.query('SELECT * FROM projects').all()).toEqual([{ id: 'fixture' }]);
  } finally { sqlite.close(); }
});

test('Worker fails safely for missing DB, missing migration, storage and asset errors', async () => {
  expect((await worker.fetch(request(input), {})).status).toBe(503);
  expect((await worker.fetch(request(input), undefined)).status).toBe(503);
  const { sqlite, env } = fixture({ migrate: false });
  try {
    const response = await worker.fetch(request(input), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Could not save. Please try again.' });
    sqlite.exec(migration);
    sqlite.exec('DROP TABLE pavilion_waitlist_signups');
    const broken = await worker.fetch(request(input), env);
    expect(broken.status).toBe(503);
    expect(await broken.json()).toEqual({ error: 'Could not save. Please try again.' });
  } finally { sqlite.close(); }
  expect((await worker.fetch(new Request('https://pavilion.invalid/'), {})).status).toBe(503);
  expect((await worker.fetch(new Request('https://pavilion.invalid/'), { ASSETS: { fetch() { throw new Error('private detail'); } } })).status).toBe(500);
});

test('Worker retains static security headers and rejects unknown mutations', async () => {
  const response = await worker.fetch(new Request('https://pavilion.invalid/'), {
    ASSETS: { async fetch() { return new Response('page', { headers: { 'Content-Type': 'text/html' } }); } }
  });
  expect(await response.text()).toBe('page');
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  expect((await worker.fetch(request(input, { path: '/api/other' }), {})).status).toBe(404);
});
