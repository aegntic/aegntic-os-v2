# Aegntic OS V2

First working slice: an outcome workspace with persistent local briefs and a six-control pre-launch evidence review. No external model, publication, account, payment or infrastructure operation is enabled.

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

Pi Durable, Convex, Cloudroom, model providers, Google services, browser/render workers, social publishing and mobile distribution are planned adapters. Calling the execution endpoint returns a not-connected result. This application does not simulate their success. Local brief storage is a temporary development boundary, not a replacement workflow engine or a deployed Convex service. GBrain is excluded from the plan.

## Verification

```sh
bun run lint
bun test
bun run build
```

The project lint script checks server/browser syntax by bundling; supplemental Oxlint was run using the approved local launcher. No ESLint/TypeScript project configuration existed and none was removed. Current evidence: four automated tests, 26 assertions, seven browser checks, and independently reviewed UI repairs. See `artifacts/product-foundry/first-run/evidence.md`.

A repeatable browser check is in `tests/browser-smoke.cjs`. Run it against the local app using a separately available Playwright installation; the check adds two labelled test briefs. `AEGNTIC_PLAYWRIGHT_MODULE` can point at an existing installation. Playwright is not auto-installed or a runtime dependency.

## Build in public

[BUILD-LOG.md](BUILD-LOG.md) records verified changes. [ROADMAP.md](ROADMAP.md) distinguishes working features from future integrations. The repository contains only this new app and its evidence; account-wide research, private sources, personal browser profiles, secrets and local databases stay outside the public source set. Public publication is not yet performed; repository destination and operative licensing are pending.

## Licensing

The owner's proposed community/commercial policy allows personal and eligible startup use with monetary recognition above the confirmed revenue/user thresholds. The operative license and legal licensor have not been finalized. See [LICENSING-STATUS.md](LICENSING-STATUS.md). This first-run code is not represented as MIT, Apache or OSI-approved open source.
