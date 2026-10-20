import { handleWaitlist, json, securityHeaders, sha256Hex, RATE_LIMIT, RATE_WINDOW } from './waitlist.js';

function d1Adapter(db) {
  return {
    storage: 'cloudflare-d1',
    failureStatus: 503,
    async allow(ip, now) {
      const key = await sha256Hex(ip);
      await db.prepare('DELETE FROM pavilion_waitlist_rates WHERE expires_at <= ?1').bind(now).run();
      // One atomic SQLite statement admits at most RATE_LIMIT requests per key/window,
      // including concurrent requests from different Worker isolates.
      const rate = await db.prepare(`
        INSERT INTO pavilion_waitlist_rates(ip_hash, count, expires_at) VALUES(?1, 1, ?2)
        ON CONFLICT(ip_hash) DO UPDATE SET count = count + 1
        RETURNING count
      `).bind(key, now + RATE_WINDOW).first();
      return rate.count <= RATE_LIMIT;
    },
    async insert({ email, interest, consentAt, removalHash }) {
      const result = await db.prepare(`
        INSERT OR IGNORE INTO pavilion_waitlist_signups(email, interest, consent_at, removal_hash)
        VALUES(?1, ?2, ?3, ?4)
      `).bind(email, interest, consentAt, removalHash).run();
      return (result?.meta?.changes ?? 0) > 0;
    },
    async remove(removalHash) {
      await db.prepare('DELETE FROM pavilion_waitlist_signups WHERE removal_hash = ?1').bind(removalHash).run();
    }
  };
}
export default {
  async fetch(request, env) {
    try {
      if (request.method === 'GET' || request.method === 'HEAD') {
        if (!env?.ASSETS?.fetch) return json({ error: 'Site assets are unavailable.' }, 503);
        const response = await env.ASSETS.fetch(request);
        const headers = new Headers(response.headers);
        for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      return await handleWaitlist(request, env?.DB?.prepare ? d1Adapter(env.DB) : null,
        request.headers.get('cf-connecting-ip') || 'edge');
    } catch {
      return json({ error: 'Could not save. Please try again.' }, 500);
    }
  }
};
