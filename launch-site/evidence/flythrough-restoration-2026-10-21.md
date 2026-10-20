# Full fly-through restoration — 21 October 2026

The previous three-view landing-page refinement missed the user's defining requirement. The full original seven-stop pavilion geometry and spatial journey from 7e3817d are restored as the primary experience. No production deployment occurred.

Changes: lazy flythrough module, seven preserved camera poses, continuous damped camera travel with dwell windows, short captions hidden in transit, compact projected labels, native modal dossiers, cool page accents and opaque reading panels. The original procedural materials, warm architectural lighting, glass/steel rotunda and blueprint wings remain. Mobile retains the journey; reduced motion defaults to a static chapter guide and permits explicit fly-through opt-in with ambient movement paused.

Signup/removal retain the previously hardened HTTP flow. Backend change only admits safe generated flythrough chunk names on the local asset route. Cloudflare assets use their existing binding.

Validation: root lint/build, launch lint/build and 42 Bun tests (395 assertions) passed. Approved Oxlint launcher resolved its existing global fallback and passed for the four changed JS files. No dependency installs or lockfile changes. Independent code review identified two static-mode usability findings; both were corrected and browser-verified: static chapter buttons now work without graphics; the first explicit reduced-motion fly-through selection now succeeds.

Browser: desktop 1440x1000 and mobile390x844 inspected; engine stop settled at03 with caption visible and one canvas. Native dossier focuses close on opening and returns focus to opener on Escape. Reduced motion starts with zero canvases, disabled motion control and readable chapter navigation. One explicit selection starts graphics. Emulation overrides cleared; preview left running at127.0.0.1:4381. Screenshot restored-flythrough-engine.png records the engine view. Physical device/GPU performance and live D1 remain unqualified. No numerical design score is asserted.
