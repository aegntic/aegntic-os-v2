# Aegntic / step inside the build

The full seven-stop architectural fly-through is the primary experience: floor plan, threshold, forge, engine rotunda, proving bridge, future atrium and terrace. The original pavilion geometry is restored. Short captions appear at camera dwell points; technical detail is in a native modal dossier. The building is a representation of the system, not live telemetry.
This is the 21 October 2026 feature preview. It has not replaced the existing protected deployment. Public access rules, production D1 migration/legacy subscriber continuity, and real-device performance qualification remain separate release gates. No 9.6 rating or production certification is asserted.

## Review locally

Use the existing Bun 1.4.3+ environment and pinned Three.js 0.186.1:

```sh
bun run build
bun start
```

Open `http://127.0.0.1:4320/`. `PORT` selects another loopback port. Dependency reproduction uses `bun install --frozen-lockfile --ignore-scripts`; no package installation is necessary in the prepared checkout. This site is separate from the agent workspace and has no agent dispatch or model credentials.

## Experience

- Full-screen scroll-controlled architectural journey with direct room navigation and next-room controls.
- Short reading panels fade during camera travel. Camera dwell points give text a stable reading window.
- Mobile retains the journey with compact controls; reduced motion and the explicit “Read the tour” option provide static room summaries.
- Signup initializes independently of the lazy graphics module. No external textures, analytics or provider calls.

## Modules

| File | Responsibility |
| --- | --- |
| `public/index.html`, `style.css` | Full-screen stage, reading panels, accessible dossier and static tour |
| `src/site-ui.js` | Bounded signup/removal requests and explicit credential download |
| `src/client.js` | Lazy graphics entry and independent signup initialization |
| `src/flythrough.js` | Original pavilion geometry, procedural materials, seven-stop camera and tour lifecycle |
| `src/pavilion.js`, `architecture.js`, `materials.js` | Retained prior three-view prototype; not used by the restored tour |
| `src/waitlist.js` | Bounded HTTP input, consent, removal hashing and shared response contract |
| `src/server.js`, `worker.js` | Local Bun/SQLite and Cloudflare asset/D1 adapters |

## Signup and deployment

Read [DEPLOYMENT.md](DEPLOYMENT.md). The Bun adapter preserves its existing local `signups` table. The Worker uses additive namespaced tables and a persisted atomic throttle. Production legacy-table reconciliation is explicitly required before switching adapters. No migration was applied remotely.

Success identifies local storage or Cloudflare D1 accurately. A new signup receives a random removal credential whose hash is stored server-side; duplicate requests cannot replace it. The browser offers a user-initiated credential download, handles uncertain network outcomes honestly and sends no email. Real signup data and runtime databases must stay outside source.

## Verification

```sh
bun run lint
bun test
bun run build
```

The root application's checks and publication scanner remain required. Worker tests execute the actual handler and unmodified SQL through a Bun SQLite D1-shape adapter. They qualify contract/SQLite behavior, not the live Cloudflare service. Browser results and limitations: [evidence/refinement-2026-10-21.md](evidence/refinement-2026-10-21.md).

## Assets and attribution

Three.js remains 0.186.1/MIT; full notice is `public/THREE-LICENSE.txt`. Existing Aegntic mark is retained. New geometry/materials are procedural and original. New `public/social/pavilion-{landscape,square}.png` are original schematic artwork, not screenshots or claims of a real model run. Reproduce with a local Pillow-capable Python environment and `../scripts/render-pavilion-social.py --font-dir /path/to/liberation`; no fonts or Pillow binaries are bundled. Notices: [../THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

Earlier `creative/` and `social/assembly-*` files are retained as historical review assets. Their descriptions and graphics predate this refinement; they are not presented as the current teaser or a fresh launch approval.
