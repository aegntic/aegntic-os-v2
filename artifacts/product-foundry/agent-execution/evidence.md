# Evidence — 2026-10-16

## Actual live execution

Pi device: pinned disler/durable-pi checkout with the delivered additive provider/recovery patch; pi-durable/pi-ai/chord 1.0.3. Node 26.7.0. App Bun 1.4.3.

The initial Anthropic smoke failed with `model_error`: its configured loopback proxy was unreachable. That is not counted as a successful provider check. The existing Codex sign-in then produced exactly `AEGNTIC_EXECUTION_OK` through Pi with gpt-6.1-sol; see live-provider-check.json. Original account auth files were only read, not copied or refreshed.

A separate qualification DB dispatched an explicitly labelled fixture through the real app HTTP route, Pi and model. The agent wrote execution-check.txt, read it back, and the host independently checked its contents. Retry reused the run ID. The final result remained DONE after the host app was stopped and reopened. See live-execution-qualification.json. No real user creative package was approved or dispatched. A later device-restart check exposed provider routing reading availability before it loaded; fixed to use the initialized catalog, then verified by live session lookup and a dedicated regression.

## Automated checks

- App project lint and build passed. Existing checks retained.
- App tests: 19 pass, 0 fail, 231 assertions. Includes approval/revision checks, concurrent retries, lost creation/message responses, restart persistence, device mismatch, old-run Stop, late admission and failed cancellation preserving stop intent.
- Added provider-boot regression passed: Codex sessions reopen before model availability loads; synthetic auth metadata, no model request; exact coding-only tool set and non-mutating submission lookup asserted.
- Real completed Codex session resolved after device restart; live profile check confirmed exactly bash/edit/read/write and recovered the saved submission ID. See live-tool-profile-check.json.
- Patched upstream backend: `npm run check` passed; `npm test` passed 10 tests, including upstream SIGKILL/checkpoint recovery using its test provider. This is distinct from the live Codex qualification and does not claim live mid-model SIGKILL reproduction.
- Approved Oxlint --resolve from both app and upstream Git roots used the existing global fallback; no project-local Oxlint declaration. Explicit changed JS/TS paths passed with no auto-fixes or fetched lint tools.
- Connected launcher started both qualified processes. Authenticated app connection route returned CONNECTED / openai-codex / gpt-6.1-sol.

## Browser observations

Actual in-app browser: main workspace shows connected Pi and an unapproved project's disabled Start/Stop controls. Opening a completed fixture through a temporary isolated qualification server showed DONE, real final answer, disabled repeat/stop and working Refresh. That tab/server was closed afterward; main connected workspace stays open. Screenshots: connected-workspace.png and completed-test-run.png.

## Review and repairs

Independent reviewer identified lost-response recovery after approval revocation, stale Stop targeting, negative lookup after uncertain admission, and stop intent erased before cancellation IO. Added read-only upstream lookup, displayed-run identity, persisted send-attempt/stop intent and corresponding regressions. Reviewer spot-check confirmed final repairs; no unresolved findings.

## Limits

Trusted local single-user worker, not an OS sandbox. Final status/answer polling, not streaming tokens. Codex model/account availability can change; expired sign-in needs refresh through Codex. STOP_UNCONFIRMED requires the page to remain open or be reopened/refreshed to retry cancellation. No recurring daemon, remote provisioning, Convex connection or publishing was added. The operative project license remains a draft decision; upstream MIT grants and notice were retained.
