# Evidence — 2026-10-15

- Project lint and build passed with Bun 1.4.3. No dependency installation or auto-fixes.
- Existing backend suite: six tests, 49 assertions passed.
- Approved Oxlint resolution from project root: global fallback /home/ae/.local/share/agent-tools/oxlint/bin/oxlint; no local declaration. Explicit changed JS files public/app.js, public/concepts.js and src/server.js passed.
- Hero browser checks: four image loads/selection/focus checks, four 390px overflow checks, full-screen open/exit and no runtime errors; ten checks passed. See browser-evidence.json.
- Creative browser regression: all ten existing approval, persistence, stale-revision and keyboard/mobile checks passed; report and screenshots in creative-regression/.
- Desktop screenshots for all four layouts visually inspected. Generated image originals are 1536×1024. Desktop and mobile captures saved.
- Final container-query refinement makes each embedded preview respond to its own available width; visible workspace verified through the actual in-app browser and captured as workspace-preview.png.
- Independent review requested but the reviewer failed with an account usage-limit message. No independent approval is claimed for this revision. Prior approval applies only to the prior creative-gate revision.
- A local preview process stopped during browser refresh. Restarted with a persistent terminal session, HTTP 200 observed, and a fresh browser tab visibly loaded the current page. The old tab's network-error page prevented further automated navigation; it was not altered or bypassed.

No remote deployment, waitlist collection, payment, publishing, or worker dispatch. Preview CTAs are deliberately illustrative. Launch graphics/video remain to be produced after direction selection. Browser fixture approvals were revoked at test end.
