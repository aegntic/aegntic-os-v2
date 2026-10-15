# First-run evidence

Status: PASS for the bounded local slice; full V2 integration and public release remain pending.

- Bun 1.4.3; no external runtime dependencies installed.
- `bun run lint`: server/browser syntax/bundle checks pass.
- `bun test`: four tests, 26 assertions, zero failures. Tests verify brief/review persistence after database reopen, replay/conflict behavior, invalid inputs/evidence, cross-origin writes, response security headers and explicit unavailable execution.
- `bun run build`: server/browser bundles pass.
- `oxlint --resolve`: approved launcher selected existing global fallback; no project-local declaration or installation exists. Supplemental explicit-file check passed without fixes. The initial invocation from the containing research workspace was rejected by the launcher; it was rerun correctly from this package.
- Browser: seven checks pass; exact results in browser-evidence.json. Includes a successful POST followed by a lost browser response, draft preservation, saved evidence after reload, five cards, mobile overflow and absence of page errors.
- Independent reviewers reproduced two UI state defects; both repaired. Follow-up review found no new critical/high issues. No user data or provider accounts involved in the browser fixtures.
- Desktop/mobile screenshots saved alongside this report.

No real Pi/Convex connection, worker recovery, accessibility conformance certification, external publication or production multi-user isolation was tested. Local records are operator assertions, not independently authenticated evidence.
