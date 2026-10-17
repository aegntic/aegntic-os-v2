# Modular runtime qualification

Observed 17 October 2026, Bun 1.4.3. This slice changes module boundaries and run ownership, without adding a new hosted provider or publishing adapter.

- **32 tests passed, 328 assertions**, including the existing workspace/execution/launch tests, replacement-module contract tests, import boundaries and legacy SQLite migration.
- Application lint/bundle checks and production build passed. Separate launch-site lint and production build passed.
- Supplemental Oxlint passed on all 12 changed/new JS test/source files. Resolution used the approved launcher and its existing global fallback; no project-local Oxlint is declared or installed. No packages were fetched or fixes applied for linting. This local fallback is not represented as a pinned CI dependency.
- All six Python publication regression tests passed. Index/history checks are run again when publishing.
- Independent code review approved the corrected owner-check ordering, descriptor identity validation, cleanup and replacement boundaries. The identified HTTP preflight bug is now a regression test: a foreign owner returns 409 without even probing Pi, and preserves the saved run state.
- Started the configured local Bun/Pi pair. `GET /api/system` reported records available and Pi connected. The browser loaded the existing seven saved briefs and showed connection readiness. No project was dispatched, approved, stopped or published during this startup check.
- Existing local data gained only the additive owner column. A separately encrypted checkpoint predating the migration remains available privately; the current source/state checkpoint is refreshed after this slice is committed.

See [sanitized local connection report](local-connection.json). This contains component IDs/status and aggregate counts; it excludes credentials, project content, paths and durable device/session identities. The connection check does not rerun a paid model or claim new model-completion qualification. Prior real provider/tool execution evidence remains separate in [agent-execution](../agent-execution/evidence.md).

The new GitHub module workflow is added for lint, tests, builds and dependency-boundary checks. Both remote workflows passed for source commit 84085cb; see the [CI report](ci.json) for exact commit and run links. New source or dependency changes must pass the same checks. No tests were skipped or removed. The unconnected Convex/worker/publishing boundaries remain explicitly unconnected.
