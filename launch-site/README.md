# Aegntic / Assembly

Local launch-site review selected by the user from three directions: bright architectural Assembly, cinematic Black box, editorial Field notes. Assembly was selected on 16 October 2026. This is a review artifact; launch graphics, teaser and release remain unapproved.

## Run

Use Bun 1.4.3+:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run build
bun start
```

Open http://127.0.0.1:4320/. Separate from the agent workspace at port 4317. It has no agent-dispatch routes or access to the Pi device token. `PORT` optionally changes the loopback port.

Three.js 0.186.1 is pinned in package.json/bun.lock, MIT notice preserved at public/THREE-LICENSE.txt. Procedural model, no remote HDRs, fonts or asset requests. Original Aegntic mark reused from the existing project at the user's direction. The 3D object is a visual metaphor, not claimed hardware. Static CSS fallback, motion pause, reduced-motion preference, background/offscreen throttling, keyboard controls and visible focus are included.

## Waitlist and sharing

The endpoint writes to a private, Git-ignored local `.data/waitlist.db` with owner-only file permissions. It validates email/interest/consent, checks same-origin JSON, limits request size and per-address attempts, ignores honeypots and deduplicates normalized addresses. It sends no email. Signups receive a one-time removal code; only its hash is stored. Repeat signup does not rotate or reveal an existing removal credential. The UI identifies local-only collection and offers removal. Never commit/export subscribers to public artifacts.

The forms default to POST and remain disabled if JavaScript fails. A failed signup is not displayed as a success. Clipboard/native-share actions share the real GitHub build URL rather than a localhost URL. No social post is sent automatically.

Before public deployment: choose a canonical public URL and configure absolute OG/canonical metadata; finalize operator/privacy/contact information and email verification/removal links; replace in-memory rate limits with deployment-appropriate abuse protection; configure private durable data storage/backups and explicit consent/suppression handling. Keep the agent workspace separate. This Bun/SQLite host has not been ported to Workers/celld. Production publication and external mail delivery are not implied by this prototype.

## Creative review package

- public/social/assembly-{landscape,square,portrait,vertical}.{svg,png}: 1920×1080, 1080×1080, 1080×1350, 1080×1920.
- creative/AEGNTIC-assembly-45s-review.mp4: 45-second / 24fps / 1920×1080 caption-led silent review cut, six gently moving scenes using a capture of the real Three.js model. No voiceover/music; not represented as a live stream or a demonstration of unconnected features.
- creative/scene-*.svg and .png: editable review artwork and timed scene sources.
- Social CTA: follow the build at the existing GitHub repository. Site CTA: join the local-review waitlist. Move to a public waitlist link only after the public destination is configured and approved.

Approval of the aesthetic does not constitute approval of the final graphics, teaser or deployment. Existing application creative approvals were not altered.

## Checks

`bun test`, `bun run lint`, `bun run build`. Two meaningful waitlist tests verify consent/origin rejection, persistence across restart, deduplication, removal and rate limiting. Root application tests remain intact; 21 total tests / 252 assertions pass. Supplemental Oxlint ran on the three new JS files via the approved global fallback, with resolution evidence. No ESLint/TypeScript tooling existed here and none was removed.

Browser verification: real WebGL canvas, assembly toggle, pause, 390px mobile width with no overflow, synthetic signup and code-based removal, clipboard sharing feedback. Review caught and fixed GET-form fallback exposure. Desktop/mobile captures under evidence/. No production tenant/security qualification is claimed.
