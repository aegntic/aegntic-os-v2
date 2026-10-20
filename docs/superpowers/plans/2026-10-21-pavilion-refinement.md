# Pavilion product experience implementation plan

> **For agentic workers:** Use subagent-driven-development with scoped ownership and independent code review.

**Goal:** Refine the existing pavilion into a clear, accessible, responsive product experience with honest claims and tested signup adapters.
**Architecture:** Server-rendered semantic HTML provides the complete story. An optional isolated Three.js viewport presents three curated frames; UI and signup initialize independently of renderer success. Bun and Worker share bounded input and crypto validation; persistence remains adapter-specific.
**Tech Stack:** Existing Bun, Three.js 0.186.1, plain HTML/CSS/JS and Cloudflare D1. No new dependencies.
**Spec:** docs/superpowers/specs/2026-10-21-pavilion-refinement.md

## Constraints

Preserve MIT/notices and the original source. No new external services, public deployment or access changes. Keep local model/runtime state out of Git. Static/mobile experience is complete without WebGL. User's quality target is an acceptance ambition, not evidence of achieved scores.

## Tasks

- [x] 1. Backend: shared request contract, Bun/D1 implementations, namespaced additive migration, durable throttle and Worker regression tests. Files: launch-site/src/{server,worker,waitlist}.js, migrations/, tests/. Review before completion.
- [x] 2. Product/UI: semantic page, premium responsive styles, factual examples, independent accessible UI/signup module. Files: launch-site/public/{index.html,style.css}, src/{client,site-ui}.js. Keep renderer contract #scene; API endpoints unchanged. Review before completion.
- [x] 3. 3D: extract existing geometry, authored three-frame camera, curated materials/light, optional quality/static modes; stop idle rendering and freeze offscreen. File: launch-site/src/pavilion.js. Review before completion.
- [x] 4. Validate: existing checks, browser desktop/mobile/keyboard/static, Worker migration tests, independent broad review; fix material findings. Record evidence without imaginary scores.
- [x] 5. Docs/source: README, build log, third-party notices, runbook and matching social image from verified scene where feasible. Commit and push feature branch; no live publish.

## Delivery evidence

Implementation pushed as `7bbc754` on `feat/pavilion-product-experience`. Both GitHub checks passed for that implementation commit: Module compatibility (39482036941) and Public source boundary (39482037115). Desktop/mobile captures and local validation are recorded in `launch-site/evidence/refinement-2026-10-21.md`. No production deployment or live D1 migration was performed.
