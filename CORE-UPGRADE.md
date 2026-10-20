# Pi Durable core 1.1.0

Qualified locally on 21 October 2026. The active external backend now uses `@earendil-works/pi-durable`, `pi-ai` and `chord` **1.1.0**, retaining Node/npm and the pinned [Disler source](https://github.com/disler/durable-pi/tree/37165c619573dbaf425463038bbffecfe576beec). This is an Aegntic overlay on that source, not an asserted new Disler release or adoption of the news-agent application.

## Reproducible boundary

Apply `integrations/pi-durable/provider-support.patch` and then `core-1.1.0.patch` to the pinned clean checkout. In `apps/dpi-backend`, run `npm ci --ignore-scripts --no-audit --no-fund`, `npm run check` and `npm test`. The core overlay includes the manifest, full npm lockfile and advertised runtime version. [core.json](integrations/pi-durable/core.json) records the source pin and lock hash. The launcher rejects a different pin, unapplied overlay, changed lockfile or wrong installed core version.

The HTTP API and Aegntic module contracts remain v1. Saved runs keep their owner, device, session and request identities. The client accepts explicitly qualified 1.0.3 and 1.1.0 versions; the normal launcher requires 1.1.0. It does not accept arbitrary minor upgrades.

## What changed upstream

The installed release changelog adds bidirectional storage scans, task start/end timestamps, generation/tool timing, incremental context caching and a Cloudflare Durable Object SQLite adapter. Its breaking changes require custom storage to honor scan order and change `TaskRuntime.context`'s cutoff argument to an options object. This backend uses bundled SQLite storage, with no custom implementation or affected positional call. These features do not imply that we have deployed a Cloudflare service or connected celld.

## Observed checks

| Check | Result |
| --- | --- |
| Backend TypeScript check | Passed |
| Backend suite, including SIGKILL recovery | 12 passed |
| 1.0.3 → 1.1.0 synthetic persisted-state migration | Passed: device identity, saved request/result and tool-free profile retained |
| In-flight fixture job across version change | Resumed; five checkpoints, one job entry, no duplicate job |
| Another candidate reopen | Saved answer/job result retained |
| Real model | Existing Codex sign-in, `openai-codex` / `gpt-6.1-sol`, exact confirmation completed |
| Full backend restart after real completion | Same saved submission recovered; exact answer and zero-tool profile verified |
| Independent core code review | No actionable findings |

Migration coverage uses an explicitly synthetic faux provider. The real model check is separate and tool-free; it is not a claim that a user's project was built. Re-run the reproducible fixture with Node and the candidate checkout's tsx loader:

```sh
node --import /candidate/apps/dpi-backend/node_modules/tsx/dist/loader.mjs \
  integrations/pi-durable/qualify-migration.mjs /old-checkout /candidate
```

## State and rollback

An encrypted private checkpoint with SQLite online backups was verified before opening existing state with the new backend. No active saved application run or upstream nonterminal task was present. Runtime configuration, tokens, model responses and checkpoint keys remain outside Git.

Stop the supervised pair before recovery. Restore the pre-upgrade private database/configuration snapshot as a consistent set; preserve the upgraded state separately. Use the retained 1.0.3 checkout and matching provider patch. To run that backend directly, use the Node command and private runtime file documented in EXECUTION.md, then start the Bun application with `bun src/server.js`; its client still accepts 1.0.3. The new supervised launcher deliberately refuses the old checkout. Do not point an old runtime at upgraded databases as an assumed downgrade path: reverse database compatibility has not been qualified. Never run both versions against the same state directory.
