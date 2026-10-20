# Third-party notices and asset provenance

Updated **21 October 2026**. This file describes the local application, its separate launch-site review and associated media production. Third-party source retains its original grants and attribution. Original Aegntic software and associated documentation are MIT licensed; that grant does not replace upstream grants or separately identified asset rights.

## Execution integration

| Component | Recorded source/version | Use and retained notice |
| --- | --- | --- |
| disler/durable-pi | `37165c619573dbaf425463038bbffecfe576beec` | External local execution backend; MIT, copyright (c) 2026 IndyDevDan. Original notice: [UPSTREAM_LICENSE](integrations/pi-durable/UPSTREAM_LICENSE). |
| `@earendil-works/pi-durable`, `pi-ai`, `chord` | 1.1.0 active; original 1.0.3 qualification retained as history. Updated npm lockfile in `core-1.1.0.patch` | MIT family from earendil-works/pi; each package and its transitive dependencies retain their own notices. The source repository does not include the upstream node_modules closure. |
| Node.js and Bun | Upstream Node runtime; Bun host requires 1.4.3+ | Separately installed runtimes, not bundled binaries. Keep their applicable notices if redistributing them. |

Provider and recovery changes are delivered as [provider-support.patch](integrations/pi-durable/provider-support.patch), not as a new license over upstream files. The patch adds provider support, read-only existing Codex sign-in access, request-ID recovery and separate coding/tool-free drafting profiles. See [EXECUTION.md](EXECUTION.md) for the qualified runtime and limits.

The Bun host uses built-in HTTP/SQLite APIs and declares no external runtime package dependencies. The separate Pi backend still requires its upstream packages. Software licenses do not grant access to Codex accounts, hosted models or provider APIs; those services retain separate terms. Credentials and private device state are excluded from source.

## Assembly launch-site dependency

Three.js **0.186.1** is MIT, copyright © 2010–2026 three.js authors. The exact full notice is preserved at [THREE-LICENSE.txt](launch-site/public/THREE-LICENSE.txt); the version is pinned by `launch-site/package.json` and `launch-site/bun.lock`.

The Assembly scene uses procedural geometry. Its social artwork and silent teaser are captures/compositions of that scene. No external model, texture, HDR environment or font asset was imported for it. Its CSS/system-font fallback does not bundle a webfont. Preserve the Three.js notice in distributions containing its code.

## Brand, visual references and generated imagery

The original Aegntic mark was retrieved from https://echo.aegntic.ai/aegntic-mark.webp at the user's direction. It is preserved without recolouring at `public/assets/aegntic-mark.webp`; retrieval/hash evidence is in [logo provenance](artifacts/product-foundry/creative-kickoff/logo-provenance.json). Use here does not grant unrelated parties general trademark or asset rights.

The glass-gallery and smoked-instrument PNGs were generated with the built-in image-generation tool. Exact hashes and method are in [asset provenance](artifacts/product-foundry/hero-layouts/asset-provenance.json). They depict illustrative material studies, not actual Aegntic hardware. Generated media is not third-party MIT source merely because it appears beside MIT dependencies.

User-supplied Aegntic PDFs, the tactile blueprint and the HTML style guide informed visual decisions; they were not imported as executable instructions or bundled reference documents in this application. Amber is Clawreform-specific. The user selected Assembly for the later launch-site review; final launch-package approval is separate.

## Narration and video production

The earlier narrated explainer is stored in the sibling `../aegntic-explainer-45s/` deliverable folder, outside this Git repository. It is separate from `launch-site/creative/AEGNTIC-assembly-45s-review.mp4`, which is a silent Assembly review cut.

- **kokoro-onnx 0.6.1:** MIT, copyright (c) 2025 github.com/thewh1teagle. Exact notice preserved at [KOKORO-ONNX-LICENSE.txt](licenses/media/KOKORO-ONNX-LICENSE.txt). Used in an isolated uv-managed environment to synthesize the public `af_sarah` voice. No personal voice cloning.
- **Kokoro-82M:** the upstream [model card](https://huggingface.co/hexgrad/Kokoro-82M) declares Apache-2.0. ONNX model and voice files came from the [runtime maintainer's model-files-v1.1 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1). The model hash and voice/timing provenance are recorded in the sibling explainer verification files. Weights and voice files remain outside this source repository and media delivery folder. This entry records model provenance; it is not a claim that every model-associated file has received a separate license audit.
- **DejaVu Sans/Serif:** used to rasterize the earlier explainer's text. The installed font license is retained at [DEJAVU-LICENSE.txt](licenses/media/DEJAVU-LICENSE.txt). Font binaries are not bundled with the video.
- **FFmpeg, Pillow, NumPy, SoundFile and ONNX Runtime:** local production/inference tools and dependencies. Their binaries/packages are not bundled with the delivered application or media. Any future redistribution of those tools needs their own resolved dependency/license notices; this is not a complete toolchain SBOM.
- The earlier explainer's ambient audio was synthesized procedurally without external music recordings or samples. HeyGen required reauthentication; no HeyGen speech generation occurred for that cut.

The narrated MP4, WebM, frame/audio fallback, subtitles and production notes are review artifacts. The older narration describes execution as planned because it predates the connected implementation. Runtime status is documented in EXECUTION.md. Neither media production nor aesthetic selection constitutes public-release approval.

## Research candidates and distribution boundary

Convex, Cloudroom, Activepieces, Crawlee, Scrapling, CloakBrowser and the other ecosystem candidates are tracked in the sibling [research notices](../multi-agent-os-integration/THIRD_PARTY_NOTICES.md). They are not all incorporated application dependencies. Cloudroom was built/tested separately; its app adapter remains unconnected. TencentDB Agent Memory and SelfSearch remain research inputs; see [MEMORY-AND-EVOLUTION.md](MEMORY-AND-EVOLUTION.md). GBrain is excluded.

Before packaging the upstream execution backend or other services, resolve and retain notices from the exact installed production dependency closure. This document and the research inventory are not substitutes for that distribution-specific notice bundle. Root Aegntic licensing remains as described in [LICENSING-STATUS.md](LICENSING-STATUS.md).

## Disler news-agent research

[disler/pi-durable-news-agent](https://github.com/disler/pi-durable-news-agent/tree/273b79bb8d3d8907cae9fbd6abd3da163ee2a343), MIT, copyright (c) 2026 IndyDevDan, is catalogued as a research candidate. Its original [MIT notice](integrations/disler/NEWS_AGENT_LICENSE) is retained. No news-agent runtime or Jev hosted model is bundled or connected. Its local Jev wrapper license does not grant hosted inference access. See [DISLER-TOOLS.md](DISLER-TOOLS.md).
