# Verification — 2026-10-15

Bun 1.4.3, local Linux. Baseline b315b25. Independent code review approved after repairs.

- Project `bun run lint` and `bun run build`: passed. Existing scripts retained, no dependencies installed.
- `bun test` from the app root: 6 tests passed, 49 assertions. Covers persistence, idempotency, input validation, cross-origin refusal, creative revision conflicts, approval invalidation and HTTP dispatch ordering.
- Approved `oxlint --resolve`: global fallback `/home/ae/.local/share/agent-tools/oxlint/bin/oxlint`; no project-local declaration. Explicit changed-file check passed for src/store.js, src/server.js, public/app.js, tests/workspace.test.js and tests/creative-browser.cjs. No autofixes.
- `tests/creative-browser.cjs`, executed with the existing bundled Playwright and Node: 10 browser checks passed (see browser-evidence.json). Includes stale revision after unrelated review refresh, current draft fetch on reopen, keyboard focus and 390px overflow.
- Existing `tests/browser-smoke.cjs` rerun using a scratch copy with output redirected to brief-review-regression/: all 7 checks passed. Original first-run evidence preserved.
- Desktop preview screenshot visually inspected; mobile viewport measured by browser.
- Independent reviewer separately reproduced the stale-approval scenario against an in-memory server: stale approval rejected, latest draft fetched correctly. No unresolved findings.
- `git diff --check`: passed.

Attempts and repairs: an initial test command mistakenly ran from the parent research folder, yielding missing-script and unrelated upstream dependency failures. It was interrupted (exit 130); this is not upstream qualification evidence. Correct project checks then passed. Initial focused lint warned about a generic method in a test request helper; narrowed to POST/PUT and passed. Independent review found that an unrelated review save could update the cached revision without updating the displayed creative draft; approvals now bind to the displayed revision. Reopen now fetches fresh state. Card selection retains keyboard focus; opening kickoff focuses its heading.

Limits: no final graphics/video rendered or verified; asset references and declared duration are operator supplied. Example fixture approvals were revoked before the browser test finished. Pi/Convex/providers/publication remain unconnected. No real user creative direction has been selected or approved. Local browser tests add clearly identified test briefs.
