# Aegntic OS V2

Local outcome workspace with persistent briefs, a six-control pre-launch evidence review and real Pi Durable agent execution through an existing Codex sign-in. Publication, payments and cloud deployment remain unconnected.

## Run locally

Requires Bun 1.4.3 or later. There are no external runtime packages to install.

```sh
bun start
```

Open the local workspace at http://127.0.0.1:4317. The server binds to loopback only. Briefs/reviews are stored in the ignored `.data/` folder. Two clearly labelled local test records may be present from the first browser run. This is a single-user development application; do not expose it publicly as a multi-user service.

## Available

- Five outcome choices: Venture Lab, Product Foundry, Experience Studio, Knowledge Engine and Agent Evolution.
- Brief creation, persistent records, idempotent retry and an event history API.
- Six review controls with evidence/applicability reasons and unresolved states.
- Explicit distinction between a completed operator review and a verified or published outcome.
- Desktop/mobile interface, local assets, keyboard labels/focus and reduced-motion support.
- Private-state exclusions and a public-ready development log.

## Not connected

Convex, Cloudroom, additional model providers, Google services, browser/render workers, social publishing and mobile distribution remain planned adapters. Plain `bun start` runs without execution credentials; connected execution requires the separate setup in EXECUTION.md. This application does not simulate unconnected services succeeding. Local brief storage is a temporary development boundary, not a replacement workflow engine or a deployed Convex service. GBrain is excluded from the plan.

## Verification

```sh
bun run lint
bun test
bun run build
```

The project lint script checks server/browser syntax by bundling; supplemental Oxlint was run using the approved local launcher. No ESLint/TypeScript project configuration existed and none was removed. Current automated checks: 19 tests and 231 assertions, plus server/browser builds. Historical browser and real-model qualification evidence is retained under `artifacts/product-foundry/`. Cloudroom qualification has one documented upstream test failure; see CLOUDROOM-QUALIFICATION.md.

A repeatable browser check is in `tests/browser-smoke.cjs`. Run it against the local app using a separately available Playwright installation; the check adds two labelled test briefs. `AEGNTIC_PLAYWRIGHT_MODULE` can point at an existing installation. Playwright is not auto-installed or a runtime dependency.

## Build in public

[BUILD-LOG.md](BUILD-LOG.md) records verified changes. [ROADMAP.md](ROADMAP.md) distinguishes working features from future integrations. The repository contains only this new app and its evidence; account-wide research, private sources, personal browser profiles, secrets and local databases stay outside the public source set. GitHub destination: https://github.com/aegntic/aegntic-os-v2. Operative licensing remains pending; publishing source does not finalize the proposed license.

## Licensing

The owner's proposed community/commercial policy allows personal and eligible startup use with monetary recognition above the confirmed revenue/user thresholds. The operative license and legal licensor have not been finalized. See [LICENSING-STATUS.md](LICENSING-STATUS.md). This first-run code is not represented as MIT, Apache or OSI-approved open source.

## Creative kickoff

Four material/aesthetic examples now precede the brief. Every project requires a saved, explicitly approved social graphics and 30–60 second teaser package before execution. Changing the package revokes approval. See [creative kickoff](CREATIVE-KICKOFF.md). Final assets are not produced or verified by the local app; operator references are recorded.

## Connected execution

Pi Durable now runs approved briefs locally with the existing Codex sign-in (gpt-6.1-sol). Open agent execution beside a saved brief. Start/reconnect, refresh, stop and final results are available. See [execution setup and limits](EXECUTION.md).

## Integration research

[Cloudroom qualification](CLOUDROOM-QUALIFICATION.md) records the runtime checks and unresolved disk-pressure failure. [Business services](BUSINESS-SERVICES.md) maps CRM, Ghost publishing/newsletters and later customer operations. These are distinct from connected capabilities.

## Assembly launch site

A separate Three.js launch-site review is in [launch-site/](launch-site/README.md). It runs on loopback port 4320, with isolated local signup storage, native/copy sharing, social masters and a 45-second silent teaser review cut. It is not publicly deployed or connected to a mail provider.
