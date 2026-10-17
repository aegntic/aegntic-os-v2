# Brief-first browser verification

Observed 17 October 2026 in the in-app browser against the local workspace.

- Initial screen shows the outcome and brief form. The creative panel and examples are hidden until a saved brief is opened.
- Saving a labelled synthetic brief opens the creative panel, focuses its heading and shows the saved objective above the four direction examples.
- A new brief starts with no selected direction, even after opening an earlier Chrome-styled fixture.
- Reopening that earlier fixture restores its saved Chrome direction and its own brief context.
- Closing the panel leaves the workspace at the brief step. No agent was dispatched and no launch package was approved during this check.

[Initial brief screen](brief-first.png) · [Saved brief above its visual examples](brief-context.png)

All 32 Bun tests passed (328 assertions); lint and explicit-file supplemental Oxlint passed. The existing creative-browser regression script was updated for the corrected order. Its full Playwright suite was not rerun in this turn; the browser observations above were performed through the in-app browser. Backend approval/revision gates remain covered by the existing tests.
