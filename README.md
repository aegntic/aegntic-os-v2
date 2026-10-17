# Aegntic OS V2

An outcome workspace for briefs, creative approvals, agent execution and pre-launch evidence. Pi Durable executes approved local briefs through an existing Codex sign-in. The separate Assembly launch site provides a local waitlist and creative review package.

Documentation reconciled on **17 October 2026** against the checked-in implementation and retained evidence. This update did not run new agents, publish, deploy or send campaigns.

## Start the workspace

Requires Bun 1.4.3+. The Bun host uses built-in HTTP and SQLite support, with no external runtime packages to install for the host itself.

```sh
bun start
```

Open http://127.0.0.1:4317/. This starts the workspace without execution credentials. To start the configured app and Pi backend together:

```sh
bun run start:connected
```

Follow [EXECUTION.md](EXECUTION.md) for the pinned upstream checkout, original npm lockfile, provider patch, private configuration and recovery. Upstream Node/npm dependencies are separate from the Bun host. Never commit account tokens, device credentials, subscriber records or runtime databases.

The services bind to loopback and are intended for one trusted local user. The worker runs with the current user's filesystem privileges; its project folder is not an OS sandbox. Local briefs, reviews and run references live in ignored `.data/` storage. Browser qualification may leave labelled test briefs.

## What works locally

- Five outcome families: Venture Lab, Product Foundry, Experience Studio, Knowledge Engine and Agent Evolution.
- Persistent briefs, idempotent retries, event history and six pre-launch evidence controls.
- Four hero/layout studies: cinematic, architectural, editorial and workbench.
- Saved creative-package approval, stale-revision protection and approval invalidation after edits.
- Pi Durable execution using the existing Codex sign-in, with start/reconnect, status refresh, stop intent and final results.
- A separate Three.js Assembly launch-site review with local signup/removal and native/copy sharing.

An operator review or model answer does not independently verify an outcome or authorize release. Creative approval is required before new dispatch; changing it does not automatically stop an existing run.

## Ownership and remaining integrations

Pi Durable owns model turns, tools, execution state and recovery. The host stores briefs, approvals and run references. Convex is the preferred shared application-data backend and remains unconnected.

Cloudroom, additional model providers, Google services, automation/extraction workers, social publishing and mobile distribution remain unconnected. Cloudroom has been built and qualified separately, with a documented upstream test failure; it has not been integrated into the app. GBrain is excluded. Tencent memory and SelfSearch are research inputs, with no assumed upstream relationship or connected memory service.

See [ROADMAP.md](ROADMAP.md), [Cloudroom qualification](CLOUDROOM-QUALIFICATION.md), [business services](BUSINESS-SERVICES.md) and [memory/evolution research](MEMORY-AND-EVOLUTION.md).

## Creative review and Assembly site

Offer 3–5 visual directions before a project build, then explicitly review the aesthetic, social graphics, a 30–60 second teaser and one CTA. Current records contain operator-supplied asset references and declared duration; the host does not inspect the referenced files or certify their contents. See [CREATIVE-KICKOFF.md](CREATIVE-KICKOFF.md).

The user selected **bright architectural Assembly** on 16 October 2026. Amber remains specific to Clawreform. Aegntic uses neutral glass, chrome, paper and obsidian with restrained cool accents. Aesthetic selection does not approve final graphics, video or deployment.

The [Assembly launch site](launch-site/README.md) runs separately on http://127.0.0.1:4320/:

```sh
cd launch-site
bun install --frozen-lockfile --ignore-scripts
bun run build
bun start
```

It uses Three.js 0.186.1 and procedural geometry. Local signups stay in its private SQLite database; it sends no email and exposes no agent-dispatch routes. Four social master sizes and a **45-second silent Assembly review cut** are included. Public deployment, mail delivery and final launch-package approval remain pending.

## Narrated explainer

A separate, earlier seven-scene explainer is saved in the sibling [explainer deliverables](../aegntic-explainer-45s/SCRIPT-AND-STORYBOARD.md):

- [Narrated 45-second MP4](../aegntic-explainer-45s/AEGNTIC-45-second-explainer-voiceover.mp4), with local Kokoro narration, music ducking and English subtitles.
- [Browser WebM](../aegntic-explainer-45s/AEGNTIC-explainer-browser.webm) and a [visual fallback player](../aegntic-explainer-45s/watch.html) using synchronized image frames and audio.
- [Voiceover provenance](../aegntic-explainer-45s/VOICEOVER-NOTES.md), narration WAV, captions and verification records.

Sibling media and research links refer to workspace deliverables outside this Git repository; supply those folders alongside the checkout for the relative links to resolve. To view the fallback over loopback from the parent workspace:

```sh
python3 -m http.server 4318 --bind 127.0.0.1 --directory outputs/aegntic-explainer-45s
```

Then open http://127.0.0.1:4318/watch.html. The fallback uses an 8 fps visual preview; the MP4 retains 1920×1080 at 24 fps. The explainer predates connected execution and describes execution as a next step. Use [EXECUTION.md](EXECUTION.md) for current capability status. It is distinct from the later silent Assembly teaser and has not been approved for publication.

## Verification

```sh
bun run lint
bun test
bun run build
```

The lint script bundles server/browser code; supplemental Oxlint follows the approved launcher and records resolution evidence. Existing checks are retained. No ESLint/TypeScript configuration existed and none was removed.

Recorded on 16 October: app-only execution qualification had 19 tests / 231 assertions; the subsequent combined app/launch suite had 21 tests / 252 assertions, including the launch site's two tests / 21 assertions. These are retained results, not new runs from this documentation update. Browser, real-provider and filesystem evidence is under `artifacts/product-foundry/`; launch evidence is under `launch-site/evidence/`.

`tests/browser-smoke.cjs` and `tests/creative-browser.cjs` use a separately available Playwright installation. `AEGNTIC_PLAYWRIGHT_MODULE` can point to it. Browser checks add labelled fixtures; Playwright is not auto-installed.

## Source, notices and licensing

[BUILD-LOG.md](BUILD-LOG.md) records changes; [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) separates incorporated code, upstream runtime dependencies, media tools and research candidates. Exact upstream notices and lockfiles remain applicable.

GitHub destination: https://github.com/aegntic/aegntic-os-v2. Account-wide research and private sources remain outside the public source set. Do not publish internal inventory metadata or runtime data with the application.

The operative Aegntic license and legal licensor remain pending. The proposed community/commercial policy uses US$1 million trailing annual gross revenue **or** 1,000 monthly active users as the commercial threshold. It does not relicense third-party code or revoke prior permissive grants. See [LICENSING-STATUS.md](LICENSING-STATUS.md). This repository is not represented as MIT, Apache or OSI-approved open source merely because its dependencies use those licenses.
