# Aegntic / the working draft

A product-first refinement of the selected Assembly architectural direction. The complete story is readable HTML: a clear brief, human review, and useful next steps. A three-view Three.js study illustrates a solid foundation and planned wings; it is a metaphor, not live hardware, telemetry, or proof that every planned service is connected.

This is the 21 October 2026 feature preview. It has not replaced the existing protected deployment. Public access rules, production D1 migration/legacy subscriber continuity, and real-device performance qualification remain separate release gates. No 9.6 rating or production certification is asserted.

## Review locally

Use the existing Bun 1.4.3+ environment and pinned Three.js 0.186.1:

```sh
bun run build
bun start
```

Open `http://127.0.0.1:4320/`. `PORT` selects another loopback port. Dependency reproduction uses `bun install --frozen-lockfile --ignore-scripts`; no package installation is necessary in the prepared checkout. This site is separate from the agent workspace and has no agent dispatch or model credentials.

## Experience

- Responsive product story, a clearly illustrative workshop campaign, dated source evidence and early-interest form.
- Three optional views: plan, core, next. No forced scroll-controlled camera or pointer parallax.
- Narrow/coarse-touch displays and reduced-motion users start in static mode. Interactive graphics are an explicit option.
- Ambient movement starts paused. Offscreen/hidden scenes stop scheduling frames. The static HTML and signup initialize before the lazy graphics import.
- Native details replace the inaccessible dossier. Mobile navigation supports Escape and restores focus. Controls disable where graphics are unavailable.
- No external fonts, texture URLs, analytics or provider calls. The rendering dependency loads in a separate local chunk.

## Modules

| File | Responsibility |
| --- | --- |
| `public/index.html`, `style.css` | Complete semantic content and responsive presentation |
| `src/site-ui.js` | Navigation, selected view, bounded signup/removal requests and explicit credential download |
| `src/client.js` | Optional graphics lifecycle and user preference selection |
| `src/pavilion.js` | Camera, lighting, frame scheduling, visibility and disposal |
| `src/architecture.js`, `materials.js` | Original model and local procedural materials |
| `src/waitlist.js` | Bounded HTTP input, consent, removal hashing and shared response contract |
| `src/server.js` | Loopback Bun/SQLite adapter and strictly mapped static assets |
| `src/worker.js` | Cloudflare asset/D1 adapter; no live deployment implied |

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
