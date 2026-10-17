# Working on Aegntic OS

Read README.md, MODULES.md, EXECUTION.md and the latest BUILD-LOG.md before changing runtime behavior. Inherit the workspace's stack, privacy, creative-review and shared lint instructions.

- Preserve contract version 1 semantics. New or replaced modules must pass compatibility tests and the explicit import boundaries in tests/boundaries.test.js.
- Pi owns execution recovery. Convex is planned shared application data, not a second workflow scheduler. The v1 records port is synchronous; do not pretend a network-backed store is a drop-in replacement.
- Never redirect saved runs to a different owner or device. Qualify migrations against fixtures, and preserve a private checkpoint before touching live state.
- Keep module selection in trusted startup code. Never dynamically load modules or expose credentials from HTTP input.
- Retain existing lint, build, behavior and publication checks. No new installs, provider connections, model dispatch, public deployment or messages are implied by running tests.
- Runtime databases, private configuration, credentials and continuation checkpoints stay out of Git. See docs/PRIVATE-WORKFLOW.md.
