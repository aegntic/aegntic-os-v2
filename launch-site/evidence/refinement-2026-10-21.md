# Pavilion refinement qualification — 21 October 2026

Source baseline: `7e3817d` on main. Changes are a feature preview, not a public deployment. The user requested a 9.6/10 quality target; no numeric score is certified by these checks.

## Observed results

- Root application lint/build passed; launch lint includes browser entry, Bun server and Worker bundles.
- Root Bun suite: **42 passed / 395 assertions**, including **12 launch adapter tests / 88 assertions**.
- Publication regression suite: **6 passed**. Supplemental explicit-file Oxlint passed through the approved launcher/global fallback; no packages or autofixes were used.
- Desktop 1440×1000: real WebGL core, plan and planned-layer views; ambient animation starts paused; no normal-load console warnings/errors observed.
- Responsive widths 320, 390, 768, 1024 and 1440: no document overflow or offscreen header/primary CTA controls.
- Mobile 390×844: static mode without canvas, menu open and Escape return focus to its control.
- Reduced motion: static mode, no canvas and disabled ambient control. Coarse-pointer default is covered by source review; no physical tablet was tested.
- Blocked optional pavilion chunk: complete product story and enabled signup remain available; status reports static graphics fallback.
- JavaScript disabled: complete readable HTML and navigation; form submit remains disabled with a contact alternative. Temporary debug settings were restored.
- Memory-only local signup: synthetic A and B signups issued distinct 48-character credentials; duplicate A cleared unrelated visible/downloadable credential state. Both test signups were removed through the UI.
- Latest labelled credential was actually downloaded through the browser. The temporary fixture signup was removed afterward. No real subscribers or outbound messages were used.
- Metadata and social PNG HEAD routes returned 200. New social art is a schematic illustration, not a screenshot or model-run evidence.

## Independent reviews

Core/adapter review, scoped UI review, artwork-script review and final whole-branch code review reported no remaining material findings after corrections. A separate reviewer also observed desktop/mobile layout, menu/Escape, CTA and keyboard-native disclosure behavior through Chrome. Review does not assign a 9.6 score or replace hardware qualification.

Fixed findings included actual Bun split-chunk naming, back/forward-cache quality restoration, coarse-pointer static defaults, focus movement during a navigation breakpoint change, and stale credential association after duplicate signup.

## Captures

- [Desktop — actual 1440×1000 browser capture](refinement-desktop.jpg)
- [Mobile — actual 390×844 browser capture](refinement-mobile.jpg)

Captures show the local feature preview using public source content. Browser screenshot export used a temporary local download anchor; it was removed immediately. No persistent DOM changes or public release occurred.

## Remaining release gates

No production D1 call/migration, subscriber-table import or access-policy change was performed. The existing domain remains protected. Live D1/Workers behavior, legacy subscriber continuity, public access intent, operational backups, delivery ownership and physical Android/iPhone/Safari performance need separate qualification under [DEPLOYMENT.md](../DEPLOYMENT.md). No production Core Web Vitals, GPU frame-rate or battery score is claimed. Existing historical media was not presented as a new teaser.
