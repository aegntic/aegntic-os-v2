# Pavilion signup adapter runbook

The Bun and Worker adapters are tested locally. This refinement does not provision a database, apply a remote migration, deploy a Worker, change routes or demonstrate production D1 behavior. Existing `wrangler.jsonc` identifies a deployment target; its presence is not evidence that its database or assets are ready. Do not run the deployment script as a verification command.

## Local review

From `launch-site/`, use the existing Bun environment:

```sh
bun run build
bun test
bun run start
```

Bun binds to loopback `127.0.0.1`, default port 4320. Signups persist in the existing `.data/waitlist.db` / `signups` table. Directory and database modes are restricted on creation. Tests use `:memory:` or temporary SQLite files with synthetic addresses. API success includes `storage: "local"`; this confirms a local save, without subscribing the address to an external provider or sending mail. The local abuse counter is process memory and resets at restart.

## Worker database preparation (separate authorized release)

The Worker requires the `DB` D1 binding and `ASSETS` binding declared in `wrangler.jsonc`. Build output must exist in `dist/`. The migration directory uses Wrangler's default `migrations/` location.

`migrations/0001_pavilion_waitlist.sql` adds only:

- `pavilion_waitlist_signups`: normalized email, chosen interest, UTC consent timestamp and SHA-256 removal hash.
- `pavilion_waitlist_rates`: SHA-256 address key, request count and expiry, plus an expiry index.

It does not alter or import legacy `signups`, application or CRM tables. If the target already contains historical subscribers in a legacy table, inspect and plan their separately authorized migration before release; their existing removal hashes must remain usable. Do not deploy this adapter over an active legacy subscriber store without resolving that continuity step. No live database has been inspected in this work.

Before an authorized release, verify the target database/account and its backups, review the migration, apply it with an already-installed compatible Wrangler to the intended target, then verify table presence and run a synthetic signup/deduplication/removal check against the authorized preview. Confirm `storage: "cloudflare-d1"` and remove the synthetic record. Provisioning, remote migration and publishing require separate authorization. No command in the local test suite contacts Cloudflare.

Missing `DB` returns HTTP 503. Missing tables or failed D1 storage return a generic HTTP 503 with no SQL, credential, database identifier or exception content. Missing static asset binding returns HTTP 503. An adapter failure never reports a successful signup.

## Request and credential contract

`POST /api/waitlist` and `POST /api/waitlist/remove` require same-origin JSON. Both modes enforce a 2,048-byte application request limit, including streamed bodies, and 12 requests per address per ten-minute window shared by signup/removal. The Bun transport also has a 2,048-byte cap. Oversize requests return 413; malformed/invalid input returns 400; origin/media-type violations return 403; throttling returns 429. Success and error responses have `Cache-Control: no-store`.

Worker throttling uses an atomic SQLite UPSERT with `RETURNING count`; counters persist across isolates/restarts. Expired counters are deleted on later requests. Stored address hashes are pseudonymous abuse data, not anonymous data; an unsalted IP hash can be guessed. Do not treat this basic per-address control as broad bot protection. Worker requests without Cloudflare's connecting-address header share the `edge` bucket. Production runtime, D1 concurrency/latency and abuse capacity remain unqualified.

A first signup returns a cryptographically random 48-character lowercase hexadecimal `removalCode`. Only its SHA-256 hash is stored. A normalized duplicate does not rotate the original credential or reveal a new one. The browser offers the credential as a local download; the visitor must retain it to remove their record using the same site's removal form. No recovery email is sent. Valid removal is idempotent and does not reveal whether the record existed. Honeypot submissions receive a generic success without inserting a record.

The Worker reports `storage: "cloudflare-d1"` only after its adapter operation succeeds. Neither mode registers paid access, promises an availability date, synchronizes CRM or sends updates automatically. Establish an owner, privacy/retention notice, contact/removal recovery route, intended sending workflow and monitoring before collecting real public addresses. Runtime databases and real contact/removal data stay outside Git.

## Verification scope

`tests/worker.test.js` invokes the actual Worker handler with a small D1 API-shape adapter executing its unmodified SQL against Bun SQLite. It covers consent and normalization, deduplication, hash-only storage, removal, header checks, invalid inputs, streamed byte limits, concurrent admissions, handler recreation, expiry, additive migration, missing bindings/tables, and generic failures. Existing local HTTP tests remain and verify persistence across restarts; local byte limits and storage truth are covered too.

This tests handler behavior and SQLite semantics. It does not emulate Workers' scheduler, deploy assets, invoke a real D1 service or verify an account's routing, database migrations, TLS, backups, performance or regulatory readiness. Complete an authorized preview smoke test and record exact results before making production claims.
