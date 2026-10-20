import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const sceneHost = document.querySelector('#scene');
const assemble = document.querySelector('#assemble');
const motion = document.querySelector('#motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
motion.setAttribute('aria-pressed', String(paused));
motion.textContent = paused ? 'Resume motion' : 'Pause motion';

// ============================================================================
// CINEMATIC STOPS & ARCHITECTURAL DOSSIERS (Marketing-grade clarity)
// ============================================================================
const STOPS = [
  {
    id: 0,
    no: '00',
    mode: 'light',
    kicker: 'SHEET A-101 · 1:100 PAVILION PLAN',
    badge: 'PLAN VIEW',
    badgeClass: '',
    title: 'Prompts die in chat. Systems ship.',
    body: 'This is not a flat drawing—it is the live 3D pavilion sliced horizontally at 1.2 metres. Scroll to raise the walls and walk inside.',
    camPos: [-6.5, 86.0, -0.5],
    camLook: [-6.5, 0.0, -0.5],
    fov: 28,
    cutHeight: 1.22,
    spot: { pos: [0.0, 1.2, -2.0], no: '03', title: 'Central Engine Rotunda', sub: 'Click to drop into the core', targetStop: 3 },
    dossier: {
      no: 'SHEET A-101 · OVERVIEW',
      title: 'The Aegntic Courtyard Pavilion',
      meta: '56.0 × 44.0 M · 6 WINGS · CENTRAL REACTOR ROTUNDA',
      text: 'Most AI products hide behind a chat box and a polished demo video. We drew Aegntic OS v2 as a physical courtyard pavilion where material honesty is law: every subsystem that passes automated verification is built in solid brushed steel and optical glass. Every subsystem still being wired stands at 1:1 scale in architectural blueprint linework.',
      facts: [
        ['West & Central Wings', 'Solid Brushed Steel & Glass (Live)'],
        ['Central Rotunda', 'Pi Durable Runtime + Codex Dispatch'],
        ['North Skybridge', 'Cloudroom Qualification (1 Pass / 1 Amber Fault)'],
        ['East Atrium', '1:1 3D Blueprint (Convex, Rust Memory, Atelier)']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/ROADMAP.md'
    }
  },
  {
    id: 1,
    no: '01',
    mode: 'light',
    kicker: 'SOUTH PAVILION · THE THRESHOLD',
    badge: 'BUILT',
    badgeClass: '',
    title: 'Zero smoke and mirrors.',
    body: 'The walls rise around you at the South Colonnade. Through the beveled optical glass partition on your right, the central reactor rotunda is already humming.',
    camPos: [-13.5, 1.85, 19.5],
    camLook: [-11.5, 1.75, 7.5],
    fov: 46,
    cutHeight: 6.8,
    spot: { pos: [-9.2, 1.85, 10.5], no: '01', title: 'Refractive Glass Wall', sub: 'IOR 1.50 · Inspect threshold dossier' },
    dossier: {
      no: 'WING 01 · THE THRESHOLD',
      title: 'South Colonnade & Optical Partition',
      meta: '14.0 × 10.0 M · CEILING 4.20 M · BEVELED GLASS IOR 1.50',
      text: 'The entrance pavilion frames the public-safe build log and the open/commercial licensing threshold. A 280mm beveled optical glass wall separates the entry walk from the central courtyard, physically refracting the 1:100 grid and the rotunda beyond.',
      facts: [
        ['Public Build Record', 'BUILD-LOG.md (Sanitized & Verified)'],
        ['Optical Partition', 'Physical transmission glass, IOR 1.50'],
        ['Columns', 'Radial brushed steel, 320mm diameter'],
        ['Licensing Threshold', 'Community & Commercial boundary']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/BUILD-LOG.md'
    }
  },
  {
    id: 2,
    no: '02',
    mode: 'light',
    kicker: 'WEST GALLERY · THE CONTROL FORGE',
    badge: '19 TESTS PASS',
    badgeClass: '',
    title: 'Direction locks before agents run.',
    body: 'Inside the West Gallery, the Six-Control Command Table and four glass Creative Monoliths enforce human sign-off before a single autonomous turn dispatches.',
    camPos: [-15.2, 2.05, 4.2],
    camLook: [-11.8, 1.35, -4.5],
    fov: 48,
    cutHeight: 7.5,
    spot: { pos: [-13.2, 1.15, -2.5], no: '02', title: 'Six-Control Command Table', sub: '6 milled interlocks · Click for spec' },
    dossier: {
      no: 'WING 02 · THE CONTROL FORGE',
      title: 'Six-Control Gate & Creative Monoliths',
      meta: '16.0 × 14.0 M · 19 AUTOMATED TESTS / 231 ASSERTIONS',
      text: 'Autonomous agents fail when given vague intent. In the Control Forge, outcome briefs, revision-locked creative packages (Chrome, Obsidian, Pearl, Amber), and six explicit human safety controls (C1–C6) must lock in green before execution can unlock.',
      facts: [
        ['Command Table', '6 debossed obsidian wells with cyan optical rails'],
        ['Creative Gate', 'Revision-bound sign-off (409 on stale assets)'],
        ['Persistence', 'Idempotent SQLite state across restarts'],
        ['Verification', '19 automated tests / 231 assertions passing']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/src/store.js'
    }
  },
  {
    id: 3,
    no: '03',
    mode: 'dark',
    kicker: 'CENTRAL ROTUNDA · THE ENGINE CORE',
    badge: 'LIVE ENGINE',
    badgeClass: 'local',
    title: 'Autonomous work that survives the night.',
    body: 'You turn east into the 17-metre dark obsidian Rotunda. At its center floats the 3-layer Pi Durable reactor—dispatching real Codex turns with full lifecycle control.',
    camPos: [-5.8, 2.25, 2.4],
    camLook: [0.4, 1.55, -2.0],
    fov: 48,
    cutHeight: 8.5,
    spot: { pos: [0.0, 1.95, -2.0], no: '03', title: '3-Layer Pi Durable Reactor', sub: 'Exploded stack · Click for engine proof' },
    dossier: {
      no: 'WING 03 · THE ENGINE ROTUNDA',
      title: 'Pi Durable Runtime & 3-Layer Core',
      meta: '17.0 M DIAMETER DRUM · OCULUS SKYLIGHT · CONNECTED_LOCAL',
      text: 'The heart of the pavilion is a circular dark-obsidian chamber housing the 3-layer Assembly reactor. Unlike stateless chat wrappers, the Pi Durable bridge manages long-running worker lifecycles with physical Start, Reconnect, Refresh, and Stop switchgear.',
      facts: [
        ['Upper Layer', 'Optical glass shroud + machined identity plate'],
        ['Middle Deck', '5 parallel Codex dispatch modules'],
        ['Lower Core', 'Milled obsidian heat-sink + cyan emissive core'],
        ['Switchgear', 'Start · Reconnect · Refresh · Stop lifecycle']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/EXECUTION.md'
    }
  },
  {
    id: 4,
    no: '04',
    mode: 'light',
    kicker: 'NORTH SKYBRIDGE · THE PROVING GROUND',
    badge: '1 PASS · 1 FAULT',
    badgeClass: 'amber',
    title: 'When something breaks, we leave the light on.',
    body: 'Stepping onto the North Skybridge, HTTP health checks shine emerald green—while the disk-pressure writer bench pulses burnt amber until its storage fault is resolved.',
    camPos: [-3.8, 2.25, -13.2],
    camLook: [1.2, 1.55, -17.5],
    fov: 50,
    cutHeight: 8.5,
    spot: { pos: [4.2, 1.55, -16.2], no: '04', title: 'Disk-Pressure Fault Rig', sub: 'Burnt Amber (#F0500F) · Inspect report', amber: true },
    dossier: {
      no: 'WING 04 · THE PROVING SKYBRIDGE',
      title: 'Cloudroom Qualification Bridge',
      meta: '18.0 × 6.5 M CANTILEVER · HONEST FAULT TELEMETRY',
      text: 'We qualify infrastructure under stress before adopting it. On this bridge, the Cloudroom HTTP lifecycle rig passed verification (green beacon), while the disk-pressure writer test triggered an ENOSPC failure—kept visibly lit in burnt amber rather than swept under the rug.',
      facts: [
        ['West Pedestal', 'HTTP Lifecycle & Readiness — PASS (Emerald)'],
        ['East Containment', 'Disk-Pressure Writer — FAIL (Burnt Amber #F0500F)'],
        ['Overhead Gantry', 'Outcomes Evaluator truss (Prepared / Not Run)'],
        ['Qualification Rule', 'No silent adoption of failing runtime slices']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/CLOUDROOM-QUALIFICATION.md'
    }
  },
  {
    id: 5,
    no: '05',
    mode: 'light',
    kicker: 'EAST ATRIUM · THE LIVING BLUEPRINT',
    badge: '1:1 WIREFRAME',
    badgeClass: 'wire',
    title: 'Walk the next wings before the steel pours.',
    body: 'Turning south into the East Atrium, solid walls give way to soaring 1:1 3D blueprint wireframes: the Convex Vault, four Rust Memory Towers, and the Media Atelier.',
    camPos: [13.5, 2.2, -13.5],
    camLook: [14.2, 1.85, -1.5],
    fov: 50,
    cutHeight: 8.5,
    spot: { pos: [16.5, 2.3, -4.5], no: '05', title: 'Rust 4-Crate Memory Towers', sub: '1:1 3D Ink Wireframe · Click for spec' },
    dossier: {
      no: 'WING 05 · THE LIVING BLUEPRINT',
      title: 'Convex Vault, Rust Memory & Media Atelier',
      meta: '22.0 × 16.0 M OPEN-AIR 3D WIREFRAME CATHEDRAL',
      text: 'Code on disk is not the same as a connected service. In the East Atrium, you walk directly through full-scale 3D architectural linework of our next three systems—complete with one solid brushed-steel preview monitor already running locally.',
      facts: [
        ['Convex Vault', 'Cylindrical 3D wireframe vault door & schema rings'],
        ['Rust Memory Towers', '4 crates: core, index, salience, consolidation'],
        ['Media Atelier', 'Overhead Remotion / FFmpeg / Satori camera rig'],
        ['Live Anchor', 'Solid brushed-chrome local preview monitor']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2/blob/main/ROADMAP.md'
    }
  },
  {
    id: 6,
    no: '06',
    mode: 'light',
    kicker: 'HORIZON TERRACE · EARLY ACCESS',
    badge: 'SQLITE VAULT',
    badgeClass: '',
    title: 'Every building starts flat. Ours ships.',
    body: 'On the sunlit South-East Terrace, the brushed-steel SQLite monolith records your reservation locally while the outbound comms shutters remain in wireframe.',
    camPos: [14.8, 2.0, 5.2],
    camLook: [6.5, 1.5, 12.5],
    fov: 45,
    cutHeight: 8.5,
    spot: { pos: [9.8, 1.4, 11.2], no: '06', title: 'SQLite Reservation Monolith', sub: 'Solid brushed steel & optical glass' },
    dossier: {
      no: 'WING 06 · THE DISPATCH TERRACE',
      title: 'Sovereign Waitlist Vault & Outbound Shutters',
      meta: 'SOUTH-EAST COURTYARD TERRACE · HOST SQLITE STORAGE',
      text: 'The walk concludes on the South-East Terrace looking back toward the central rotunda. The solid brushed-steel monolith mints your seat directly into a local SQLite database with a 48-character self-removal key, while external CRM and newsletter shutters stay in blueprint ink until connected.',
      facts: [
        ['Waitlist Monolith', 'Solid brushed steel + optical glass + SQLite'],
        ['Privacy Control', '48-character cryptographic removal key'],
        ['Outbound Shutters', 'Twenty CRM · Listmonk · Chatwoot (Wireframe)'],
        ['Network Policy', 'Strict self-origin CSP · Zero third-party trackers']
      ],
      link: 'https://github.com/aegntic/aegntic-os-v2'
    }
  }
];

// Draw the geometric `ae.` ligature mark onto a 2D canvas (matching ae-logo.png / mark.webp geometry, NEVER plain typed font)
function drawAeGeometricMark(ctx, x, y, size, color = '#181a1b', frame = true) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 100;
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (frame) {
    ctx.lineWidth = 7;
    ctx.strokeRect(4, 4, 92, 92);
  }

  // Geometric 'a' + fused 'e' ligature curves + period dot
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left 'a' arch and double-bowl
  ctx.beginPath();
  ctx.moveTo(18, 38);
  ctx.bezierCurveTo(20, 26, 44, 26, 46, 40);
  ctx.lineTo(46, 72);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(46, 49);
  ctx.bezierCurveTo(22, 49, 16, 56, 17, 65);
  ctx.bezierCurveTo(18, 74, 38, 74, 46, 65);
  ctx.stroke();

  // Fused crossbar from 'a' stem into 'e' loop
  ctx.beginPath();
  ctx.moveTo(46, 52);
  ctx.lineTo(82, 52);
  ctx.bezierCurveTo(83, 33, 68, 27, 58, 33);
  ctx.bezierCurveTo(48, 39, 48, 63, 59, 69);
  ctx.bezierCurveTo(68, 74, 78, 70, 82, 63);
  ctx.stroke();

  // Signature fused period dot on right frame
  ctx.beginPath();
  ctx.arc(91, 56, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Create radial brushed metal texture
function createBrushedMetalTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#cfd5dc';
  ctx.fillRect(0, 0, 512, 512);
  for (let r = 6; r < 360; r += 1.5) {
    const a = 0.04 + ((r * 13) % 9) * 0.007;
    ctx.strokeStyle = r % 3 === 0 ? `rgba(255,255,255,${a})` : `rgba(30,38,46,${a})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Create high-contrast, museum-grade 1:100 Architectural Plan Sheet Texture (56m × 48m courtyard pavilion)
function createPavilionBlueprintTexture(onLoadCallback) {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 2048;
  const ctx = c.getContext('2d');

  // World coordinates: X from -28m to +28m (56m wide), Z from -26m to +26m (52m deep)
  const wx = (x) => ((x + 28) / 56) * c.width;
  const wz = (z) => ((z + 26) / 52) * c.height;

  function paintSheet(logoImg) {
    // Warm architectural drafting paper (#efebe2)
    ctx.fillStyle = '#efebe2';
    ctx.fillRect(0, 0, c.width, c.height);

    // Fine drafting grid (every 1m)
    ctx.strokeStyle = 'rgba(24, 26, 27, 0.065)';
    ctx.lineWidth = 1;
    for (let x = -28; x <= 28; x += 1) {
      const px = wx(x);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, c.height); ctx.stroke();
    }
    for (let z = -26; z <= 26; z += 1) {
      const pz = wz(z);
      ctx.beginPath(); ctx.moveTo(0, pz); ctx.lineTo(c.width, pz); ctx.stroke();
    }

    // Major structural 4m grid lines
    ctx.strokeStyle = 'rgba(24, 26, 27, 0.15)';
    ctx.lineWidth = 1.8;
    for (let x = -24; x <= 24; x += 4) {
      const px = wx(x);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, c.height); ctx.stroke();
    }
    for (let z = -24; z <= 24; z += 4) {
      const pz = wz(z);
      ctx.beginPath(); ctx.moveTo(0, pz); ctx.lineTo(c.width, pz); ctx.stroke();
    }

    // Outer architectural sheet border
    ctx.strokeStyle = 'rgba(24, 26, 27, 0.75)';
    ctx.lineWidth = 5;
    ctx.strokeRect(wx(-23.5), wz(-22.5), wx(23.5) - wx(-23.5), wz(21.5) - wz(-22.5));

    // Helper for drawing bold, readable architectural room zones on the plan
    function drawWingZone(x1, z1, x2, z2, no, name, sub, isSolid = true, accent = false) {
      const px1 = wx(x1), pz1 = wz(z1), w = wx(x2) - px1, h = wz(z2) - pz1;
      ctx.fillStyle = accent
        ? 'rgba(0, 200, 255, 0.08)'
        : isSolid
          ? 'rgba(24, 26, 27, 0.045)'
          : 'rgba(24, 26, 27, 0.015)';
      ctx.fillRect(px1, pz1, w, h);

      ctx.save();
      if (!isSolid) ctx.setLineDash([16, 11]);
      ctx.strokeStyle = isSolid ? '#181a1b' : 'rgba(24, 26, 27, 0.7)';
      ctx.lineWidth = isSolid ? 6 : 3.5;
      ctx.strokeRect(px1, pz1, w, h);
      ctx.restore();

      // Big, high-contrast room number & name (legible from overhead!)
      ctx.fillStyle = '#f0500f';
      ctx.font = '800 32px monospace';
      ctx.fillText(no, px1 + 28, pz1 + 52);

      ctx.fillStyle = '#181a1b';
      ctx.font = '800 34px sans-serif';
      ctx.fillText(name, px1 + 82, pz1 + 52);

      ctx.fillStyle = 'rgba(24, 26, 27, 0.72)';
      ctx.font = '600 20px monospace';
      ctx.fillText(sub, px1 + 28, pz1 + 86);
    }

    // 01: South-West Entry Pavilion
    drawWingZone(-20.5, 6.5, -7.5, 16.5, '01', 'THE THRESHOLD', 'OPTICAL GLASS IOR 1.50 · BUILD LOG', true, false);
    // 02: West Gallery — The Control Forge
    drawWingZone(-20.5, -10.0, -7.5, 4.5, '02', 'THE CONTROL FORGE', '6-CONTROL TABLE & 4 VITRINES · PASS', true, false);
    // 04: North Skybridge — The Proving Ground
    drawWingZone(-5.5, -19.5, 10.5, -12.5, '04', 'PROVING SKYBRIDGE', 'HTTP PASS (GREEN) · WRITER FAULT (AMBER)', true, false);
    // 05: East Wing Cathedral — The Living Blueprint
    drawWingZone(9.0, -11.0, 21.5, 4.5, '05', 'BLUEPRINT ATRIUM', '1:1 3D INK: CONVEX · RUST MEMORY · ATELIER', false, false);
    // 06: South-East Terrace — The Dispatch Dock
    drawWingZone(7.5, 6.5, 21.5, 16.5, '06', 'DISPATCH TERRACE', 'SQLITE MONOLITH (LIVE) · OUTBOUND SHUTTERS', false, false);

    // 03: Central Circular Reactor Rotunda (x = 0, z = -2, Radius = 7.8m)
    const rCx = wx(0), rCz = wz(-2.0), rRad = wx(7.8) - wx(0);
    ctx.fillStyle = 'rgba(0, 200, 255, 0.09)';
    ctx.beginPath();
    ctx.arc(rCx, rCz, rRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#181a1b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(rCx, rCz, rRad, 0, Math.PI * 2);
    ctx.stroke();

    // Inner concentric reactor ring on floor plan
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = '#0088b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(rCx, rCz, rRad * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f0500f';
    ctx.font = '800 32px monospace';
    ctx.fillText('03', rCx - 165, rCz - rRad + 68);
    ctx.fillStyle = '#181a1b';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('ENGINE ROTUNDA', rCx - 110, rCz - rRad + 68);
    ctx.fillStyle = 'rgba(24, 26, 27, 0.78)';
    ctx.font = '600 20px monospace';
    ctx.fillText('PI DURABLE CORE · 3-LAYER REACTOR', rCx - 175, rCz + rRad - 42);

    // Dashed Camera Walkthrough Path Curve across the Pavilion
    ctx.save();
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = '#f0500f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(wx(-14), wz(18.5));
    ctx.quadraticCurveTo(wx(-14), wz(8), wx(-14), wz(-2));
    ctx.quadraticCurveTo(wx(-14), wz(-4), wx(0), wz(-2));
    ctx.quadraticCurveTo(wx(0), wz(-15), wx(4), wz(-16));
    ctx.quadraticCurveTo(wx(15), wz(-16), wx(15), wz(-2));
    ctx.lineTo(wx(14), wz(11.5));
    ctx.stroke();
    ctx.restore();

    // Central South Courtyard Water/Glass Reflecting Basin & Actual `ae.` Logo Shape
    const cyX = wx(-5.2), cyZ = wz(8.2), cyW = wx(5.2) - cyX, cyH = wz(15.2) - cyZ;
    ctx.strokeStyle = 'rgba(24, 26, 27, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(cyX, cyZ, cyW, cyH);

    if (logoImg) {
      const lw = 190;
      const lh = (logoImg.height / logoImg.width) * lw;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, wx(0) - lw / 2, wz(11.2) - lh / 2, lw, lh);
      ctx.globalAlpha = 1.0;
    } else {
      drawAeGeometricMark(ctx, wx(0) - 55, wz(11.2) - 55, 110, '#181a1b', true);
    }

    // Architectural Dimension Callouts around perimeter
    ctx.fillStyle = '#181a1b';
    ctx.font = '700 22px monospace';
    ctx.fillText('56.00 M PAVILION SPAN', wx(-4.5), wz(-23.2));
    ctx.fillText('SOUTH ENTRY PORTAL ▲', wx(-18.5), wz(19.2));
    ctx.fillText('COURTYARD AXIS · 1:100', wx(-4.2), wz(16.2));
  }

  paintSheet(null);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // Load the actual ae-logo.png shape onto the blueprint sheet
  const img = new Image();
  img.onload = () => {
    paintSheet(img);
    tex.needsUpdate = true;
    if (onLoadCallback) onLoadCallback(img);
  };
  img.src = '/assets/ae-logo.png';

  return tex;
}

// Create crisp architectural plaque texture using the geometric ae. mark
function createPlaqueTexture(title, subtitle, status, statusColor = '#00c8ff', darkBg = false, logoImg = null) {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = darkBg ? '#12161c' : '#ece8de';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = darkBg ? 'rgba(0, 200, 255, 0.55)' : '#181a1b';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, c.width - 20, c.height - 20);

  ctx.fillStyle = statusColor;
  ctx.fillRect(36, 38, 18, 18);
  ctx.fillStyle = darkBg ? '#f3efe6' : '#181a1b';
  ctx.font = '700 22px monospace';
  ctx.fillText(status, 66, 55);

  ctx.font = '800 44px sans-serif';
  ctx.fillText(title, 36, 130);

  ctx.fillStyle = darkBg ? '#9ba8b5' : '#4a5256';
  ctx.font = '600 22px monospace';
  ctx.fillText(subtitle, 36, 184);

  if (logoImg) {
    ctx.save();
    if (darkBg) ctx.filter = 'invert(1)';
    ctx.drawImage(logoImg, c.width - 130, 34, 88, 48);
    ctx.restore();
  } else {
    drawAeGeometricMark(ctx, c.width - 102, 28, 66, darkBg ? '#f3efe6' : '#181a1b', true);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0xefebe2, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  sceneHost.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xefebe2);
  scene.fog = new THREE.FogExp2(0xefebe2, 0.011);

  const camera = new THREE.PerspectiveCamera(24, 1, 0.2, 180);

  const studio = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  studio.dispose();
  pmrem.dispose();

  // Horizontal Section Cut Plane (Y = 1.22m in Plan View -> Y = 8.5m in 3D Walkthrough)
  const sectionPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.22);

  // Lighting: Warm architectural late-afternoon sun + Rotunda cyan core light + Bridge fault beacon
  const hemiLight = new THREE.HemisphereLight(0xfffcf5, 0x6e7880, 2.5);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xfff8eb, 4.0);
  sun.position.set(-18, 34, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 90 });
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xcbe2f8, 1.6);
  fill.position.set(20, 14, -18);
  scene.add(fill);

  const rotundaLight = new THREE.PointLight(0x00c8ff, 5.0, 18, 1.4);
  rotundaLight.position.set(0, 2.2, -2.0);
  scene.add(rotundaLight);

  const faultLight = new THREE.PointLight(0xf0500f, 3.8, 10, 1.5);
  faultLight.position.set(4.2, 1.8, -16.2);
  scene.add(faultLight);

  // ============================================================================
  // MATERIALS (Brushed Radial Steel, Milled Obsidian, Optical Glass, Blueprint Ink)
  // ============================================================================
  const brushedMap = createBrushedMetalTexture();
  const brushedSilver = new THREE.MeshStandardMaterial({
    color: 0xd8dde2,
    metalness: 0.88,
    roughness: 0.22,
    bumpMap: brushedMap,
    bumpScale: 0.008,
    clippingPlanes: [sectionPlane]
  });
  const polishedChrome = new THREE.MeshStandardMaterial({
    color: 0xeaf0f6,
    metalness: 0.96,
    roughness: 0.11,
    clippingPlanes: [sectionPlane]
  });
  const milledObsidian = new THREE.MeshStandardMaterial({
    color: 0x1a2028,
    metalness: 0.8,
    roughness: 0.26,
    bumpMap: brushedMap,
    bumpScale: 0.006,
    clippingPlanes: [sectionPlane]
  });
  const warmStoneWall = new THREE.MeshStandardMaterial({
    color: 0xe3dfd5,
    metalness: 0.08,
    roughness: 0.78,
    clippingPlanes: [sectionPlane]
  });
  const opticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xe8f4fc,
    metalness: 0.04,
    roughness: 0.06,
    transmission: 0.92,
    thickness: 1.1,
    ior: 1.5,
    clearcoat: 1,
    attenuationColor: new THREE.Color(0x8ec5de),
    attenuationDistance: 4.5,
    clippingPlanes: [sectionPlane]
  });
  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x00d2ff,
    emissive: 0x00b8ff,
    emissiveIntensity: 2.0,
    metalness: 0.3,
    roughness: 0.2,
    clippingPlanes: [sectionPlane]
  });
  const amberFaultMat = new THREE.MeshStandardMaterial({
    color: 0xf0500f,
    emissive: 0xf0500f,
    emissiveIntensity: 2.2,
    metalness: 0.2,
    roughness: 0.25,
    clippingPlanes: [sectionPlane]
  });
  const emeraldPassMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 1.7,
    metalness: 0.3,
    roughness: 0.25,
    clippingPlanes: [sectionPlane]
  });

  // Wireframe Line Materials
  const inkLineMat = new THREE.LineBasicMaterial({
    color: 0x181a1b,
    transparent: true,
    opacity: 0.85,
    clippingPlanes: [sectionPlane]
  });
  const cyanWireMat = new THREE.LineBasicMaterial({
    color: 0x008eb8,
    transparent: true,
    opacity: 0.82,
    clippingPlanes: [sectionPlane]
  });
  const amberWireMat = new THREE.LineBasicMaterial({
    color: 0xf0500f,
    transparent: true,
    opacity: 0.9,
    clippingPlanes: [sectionPlane]
  });
  const dashedBlueprintMat = new THREE.LineDashedMaterial({
    color: 0x181a1b,
    dashSize: 0.35,
    gapSize: 0.18,
    transparent: true,
    opacity: 0.8,
    clippingPlanes: [sectionPlane]
  });

  // Top-plate label canvas for the 3-Layer Assembly Reactor (updates once ae-logo.png loads)
  const coreLabelCanvas = document.createElement('canvas');
  coreLabelCanvas.width = 768;
  coreLabelCanvas.height = 256;
  const coreLabelCtx = coreLabelCanvas.getContext('2d');
  const coreLabelTex = new THREE.CanvasTexture(coreLabelCanvas);
  coreLabelTex.colorSpace = THREE.SRGBColorSpace;

  function paintCoreLabel(logoImg) {
    coreLabelCtx.fillStyle = '#dde3e9';
    coreLabelCtx.fillRect(0, 0, 768, 256);
    coreLabelCtx.strokeStyle = '#181a1b';
    coreLabelCtx.lineWidth = 4;
    coreLabelCtx.strokeRect(12, 12, 744, 232);
    if (logoImg) {
      coreLabelCtx.drawImage(logoImg, 64, 48, 210, 112);
    } else {
      drawAeGeometricMark(coreLabelCtx, 64, 48, 108, '#181a1b', true);
    }
    coreLabelCtx.fillStyle = '#006b8f';
    coreLabelCtx.font = '700 22px monospace';
    coreLabelCtx.fillText('PI DURABLE CORE  ·  CONNECTED_LOCAL', 64, 206);
    coreLabelTex.needsUpdate = true;
  }
  paintCoreLabel(null);

  // 1:100 Architectural Pavilion Floor Slab
  const floorTex = createPavilionBlueprintTexture((loadedLogoImg) => {
    paintCoreLabel(loadedLogoImg);
  });
  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 52),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.04
    })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const pavilion = new THREE.Group();
  scene.add(pavilion);

  // Helper: add architectural element with CAD edge overlay
  function addPart(geometry, material, parent, x, y, z, edgeMat = inkLineMat, rx = 0, ry = 0, rz = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.set(rx, ry, rz);
    if (material) {
      const m = new THREE.Mesh(geometry, material);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
    if (edgeMat) {
      const edges = new THREE.EdgesGeometry(geometry, 20);
      const line = new THREE.LineSegments(edges, edgeMat);
      if (edgeMat.isLineDashedMaterial) line.computeLineDistances();
      g.add(line);
    }
    parent.add(g);
    return g;
  }

  // ============================================================================
  // WING 01: SOUTH-WEST ENTRY PAVILION & GLASS THRESHOLD (x = -14, z = +11.5)
  // ============================================================================
  const wing01 = new THREE.Group();
  wing01.position.set(-14, 0, 11.5);
  pavilion.add(wing01);

  // West solid stone wall + high-contrast dark lintel
  addPart(new THREE.BoxGeometry(0.35, 4.0, 10.0), warmStoneWall, wing01, -6.5, 2.0, 0, inkLineMat);
  // 6 Cylindrical Brushed-Steel Colonnade Columns
  for (const cx of [-6.0, -2.0, 2.0, 6.0]) {
    for (const cz of [-4.6, 4.6]) {
      addPart(new THREE.CylinderGeometry(0.18, 0.18, 4.0, 24), brushedSilver, wing01, cx, 2.0, cz, inkLineMat);
    }
  }
  // Cantilevered Roof Slab with Skylight cutouts (above 1.22m so invisible in Plan View, dramatic at Eye Level!)
  addPart(new THREE.BoxGeometry(13.6, 0.28, 10.4), warmStoneWall, wing01, 0, 4.14, 0, inkLineMat);

  // Thick Beveled Optical Glass Partition Wall on the East side (refracting the courtyard & Rotunda!)
  addPart(new RoundedBoxGeometry(0.28, 3.6, 7.6, 3, 0.08), opticalGlass, wing01, 5.2, 1.8, -0.4, cyanWireMat);
  addPart(new RoundedBoxGeometry(0.48, 0.18, 7.8, 2, 0.04), brushedSilver, wing01, 5.2, 0.09, -0.4, inkLineMat);

  // Pivoted Brushed-Steel & Glass Entry Door at South Portal
  addPart(new RoundedBoxGeometry(2.4, 3.8, 0.16, 2, 0.04), brushedSilver, wing01, -1.8, 1.9, 4.6, inkLineMat, 0, 0.42, 0);

  // Build-Log Architectural Plaque on West Wall
  const p1Mat = new THREE.MeshStandardMaterial({
    map: createPlaqueTexture('THE GLASS THRESHOLD', 'PUBLIC BUILD LOG · OPTICAL PARTITION IOR 1.50', '01 · BUILT', '#00c8ff', false),
    roughness: 0.4,
    clippingPlanes: [sectionPlane]
  });
  const p1Mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.08), p1Mat);
  p1Mesh.position.set(-6.3, 1.95, 0);
  p1Mesh.rotation.y = Math.PI / 2;
  wing01.add(p1Mesh);

  // ============================================================================
  // WING 02: WEST VAULTED GALLERY — THE CONTROL FORGE (x = -14, z = -2.5)
  // ============================================================================
  const wing02 = new THREE.Group();
  wing02.position.set(-14, 0, -2.5);
  pavilion.add(wing02);

  // West & North Enclosure Walls
  addPart(new THREE.BoxGeometry(0.35, 4.2, 14.0), brushedSilver, wing02, -6.5, 2.1, 0, inkLineMat);
  addPart(new THREE.BoxGeometry(13.0, 4.2, 0.35), warmStoneWall, wing02, 0, 2.1, -7.0, inkLineMat);
  // Vaulted Clerestory Roof Beams
  for (let z = -6; z <= 6; z += 3) {
    addPart(new THREE.BoxGeometry(13.2, 0.32, 0.28), brushedSilver, wing02, 0, 4.2, z, inkLineMat);
  }
  // Courtyard Mullions along East side (framing the view into the Central Rotunda!)
  for (let z = -6.5; z <= -2.5; z += 2.0) {
    addPart(new THREE.BoxGeometry(0.14, 4.2, 0.14), milledObsidian, wing02, 6.4, 2.1, z, inkLineMat);
  }
  addPart(new RoundedBoxGeometry(0.12, 3.8, 4.2, 2, 0.02), opticalGlass, wing02, 6.4, 1.9, -4.5, cyanWireMat);

  // Centerpiece Six-Control Command Table (C1–C6) with debossed milled wells & cyan hot-core under-glow
  const forgeDesk = new THREE.Group();
  forgeDesk.position.set(0.5, 0, 0);
  wing02.add(forgeDesk);

  addPart(new RoundedBoxGeometry(2.6, 0.88, 4.6, 3, 0.08), brushedSilver, forgeDesk, 0, 0.44, 0, inkLineMat);
  addPart(new RoundedBoxGeometry(2.38, 0.14, 4.35, 3, 0.04), milledObsidian, forgeDesk, 0, 0.94, 0, inkLineMat);

  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const dx = -0.52 + col * 1.04;
    const dz = -1.35 + row * 1.35;
    addPart(new THREE.BoxGeometry(0.66, 0.04, 0.88), cyanEmissiveMat, forgeDesk, dx, 1.02, dz, null);
    addPart(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 24), polishedChrome, forgeDesk, dx, 1.1, dz, inkLineMat);
  }

  // Four Glass Creative Kickoff Monoliths (Chrome, Obsidian, Pearl, Amber) along West Wall
  const sculptMats = [polishedChrome, milledObsidian, brushedSilver, amberFaultMat];
  for (let i = 0; i < 4; i++) {
    const vz = -4.5 + i * 3.0;
    addPart(new RoundedBoxGeometry(0.95, 1.1, 0.95, 2, 0.04), brushedSilver, wing02, -4.6, 0.55, vz, inkLineMat);
    addPart(new THREE.BoxGeometry(0.86, 0.03, 0.86), cyanEmissiveMat, wing02, -4.6, 1.12, vz, null);
    const sGeo = i % 2 === 0 ? new THREE.OctahedronGeometry(0.28, 0) : new RoundedBoxGeometry(0.4, 0.4, 0.4, 2, 0.06);
    addPart(sGeo, sculptMats[i], wing02, -4.6, 1.5, vz, inkLineMat, 0.35, 0.6, 0);
    addPart(new RoundedBoxGeometry(0.9, 0.92, 0.9, 2, 0.04), opticalGlass, wing02, -4.6, 1.58, vz, cyanWireMat);
  }

  // ============================================================================
  // WING 03: CENTRAL CIRCULAR ROTUNDA — THE PI DURABLE REACTOR (x = 0, z = -2.0)
  // ============================================================================
  const rotunda = new THREE.Group();
  rotunda.position.set(0, 0, -2.0);
  pavilion.add(rotunda);

  // 16 Curved Dark-Obsidian Perimeter Columns & 4 Arc Wall Segments (leaving West, North, East, South portals open!)
  const rotundaRadius = 7.8;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    // Skip columns directly inside the 4 cardinal portals
    const deg = ((angle * 180) / Math.PI) % 90;
    if (deg < 14 || deg > 76) continue;
    const rx = Math.cos(angle) * rotundaRadius;
    const rz = Math.sin(angle) * rotundaRadius;
    addPart(
      new RoundedBoxGeometry(0.45, 4.8, 1.45, 2, 0.05),
      milledObsidian,
      rotunda,
      rx,
      2.4,
      rz,
      cyanWireMat,
      0,
      -angle,
      0
    );
  }

  // Circular Overhead Oculus Ring Beam & Cyan Light Halo (at Y = 4.8m)
  const oculusGeo = new THREE.TorusGeometry(rotundaRadius, 0.28, 16, 64);
  addPart(oculusGeo, milledObsidian, rotunda, 0, 4.8, 0, cyanWireMat, Math.PI / 2, 0, 0);
  const innerHaloGeo = new THREE.TorusGeometry(4.2, 0.08, 12, 48);
  addPart(innerHaloGeo, cyanEmissiveMat, rotunda, 0, 4.65, 0, null, Math.PI / 2, 0, 0);

  // Concentric Glowing Cyan Floor Ring recessed into the Rotunda floor
  const floorRingGeo = new THREE.RingGeometry(3.55, 3.72, 64);
  const floorRing = new THREE.Mesh(floorRingGeo, cyanEmissiveMat);
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.015;
  rotunda.add(floorRing);

  // Curved Lifecycle Switchgear Consoles (Start / Reconnect / Refresh / Stop) flanking the Rotunda
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 0.68 + i * 0.22;
    const sx = Math.cos(a) * 5.6;
    const sz = Math.sin(a) * 5.6;
    addPart(new RoundedBoxGeometry(0.85, 1.45, 1.1, 2, 0.05), milledObsidian, rotunda, sx, 0.725, sz, cyanWireMat, 0, -a, 0);
    addPart(new THREE.BoxGeometry(0.18, 0.08, 0.75), cyanEmissiveMat, rotunda, sx, 1.48, sz, null, 0, -a, 0);
  }

  // Centerpiece Exploded 3-Layer Assembly Reactor inside the Rotunda
  const machine = new THREE.Group();
  machine.position.set(0, 1.65, 0);
  machine.rotation.y = -0.45;
  rotunda.add(machine);

  const layers = [];
  function box(w, h, d, material, parent, x = 0, y = 0, z = 0, radius = 0.06, edgeMat = cyanWireMat) {
    const geo = new RoundedBoxGeometry(w, h, d, 3, radius);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (edgeMat) {
      const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 22), edgeMat);
      mesh.add(line);
    }
    parent.add(mesh);
    return mesh;
  }

  for (let i = 0; i < 3; i++) {
    const layer = new THREE.Group();
    machine.add(layer);
    box(3.5, 0.14, 2.8, polishedChrome, layer, 0, -0.14, 0, 0.05, inkLineMat);
    box(3.3, 0.22, 2.62, i === 1 ? opticalGlass : brushedSilver, layer, 0, 0, 0, 0.05, cyanWireMat);
    if (i !== 1) box(3.12, 0.03, 2.45, opticalGlass, layer, 0, 0.13, 0, 0.02, null);
    for (const x of [-1.46, 1.46]) {
      for (const z of [-1.12, 1.12]) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20), milledObsidian);
        bolt.position.set(x, 0.15, z);
        layer.add(bolt);
      }
    }
    layers.push(layer);
  }

  box(1.65, 0.46, 1.35, milledObsidian, layers[0], 0.1, 0.35, 0.06, 0.09, cyanWireMat);
  box(1.48, 0.1, 1.2, cyanEmissiveMat, layers[0], 0.1, 0.62, 0.06, 0.03, null);
  for (let i = 0; i < 13; i++) {
    box(0.06, 0.26, 1.12, polishedChrome, layers[0], -0.55 + i * 0.1, 0.46, 0.06, 0.01, null);
  }
  for (let i = 0; i < 5; i++) {
    box(0.45, 0.06, 0.7, milledObsidian, layers[1], -1.0 + i * 0.5, 0.16, -0.52, 0.02, cyanWireMat);
  }
  for (let i = 0; i < 11; i++) {
    box(0.06, 0.06, 0.54, polishedChrome, layers[1], -0.85 + i * 0.17, 0.18, 0.62, 0.01, null);
  }
  box(2.95, 0.52, 2.3, opticalGlass, layers[2], 0, 0.38, 0, 0.12, cyanWireMat);
  box(3.1, 0.08, 2.48, polishedChrome, layers[2], 0, 0.68, 0, 0.03, inkLineMat);

  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 0.58),
    new THREE.MeshStandardMaterial({ map: coreLabelTex, roughness: 0.4, metalness: 0.3, clippingPlanes: [sectionPlane] })
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, 0.725, 0);
  layers[2].add(labelMesh);

  const rails = [];
  for (const x of [-1.36, 1.36]) {
    for (const z of [-1.02, 1.02]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.3, 16), polishedChrome);
      rail.position.set(x, -0.15, z);
      machine.add(rail);
      rails.push(rail);
    }
  }

  // ============================================================================
  // WING 04: NORTH CANTILEVERED SKYBRIDGE — THE PROVING GROUND (x = +2.5, z = -16.0)
  // ============================================================================
  const bridge = new THREE.Group();
  bridge.position.set(2.5, 0, -16.0);
  pavilion.add(bridge);

  // Structural Steel Bridge Deck & Side Truss Frames
  addPart(new THREE.BoxGeometry(15.5, 0.18, 6.8), brushedSilver, bridge, 0, 0.09, 0, inkLineMat);
  addPart(new THREE.BoxGeometry(15.5, 0.35, 6.8), null, bridge, 0, 3.8, 0, inkLineMat);
  for (let x = -7.0; x <= 7.0; x += 3.5) {
    addPart(new THREE.BoxGeometry(0.22, 3.8, 0.22), brushedSilver, bridge, x, 1.9, -3.2, inkLineMat);
    addPart(new THREE.BoxGeometry(0.22, 3.8, 0.22), brushedSilver, bridge, x, 1.9, 3.2, inkLineMat);
  }

  // Left Pedestal: HTTP Lifecycle Rig (PASS — Emerald Beacon)
  addPart(new RoundedBoxGeometry(1.8, 1.15, 1.8, 2, 0.05), brushedSilver, bridge, -3.2, 0.575, -1.6, inkLineMat);
  addPart(new THREE.CylinderGeometry(0.28, 0.28, 0.55, 24), emeraldPassMat, bridge, -3.2, 1.42, -1.6, inkLineMat);

  // Right Containment Bench: Disk-Pressure Writer Rig (FAIL — Pulsing Burnt Amber #F0500F + Hazard Wireframe Cage)
  addPart(new RoundedBoxGeometry(2.2, 1.15, 2.2, 2, 0.05), milledObsidian, bridge, 1.7, 0.575, -0.2, amberWireMat);
  const faultBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.65, 24), amberFaultMat);
  faultBeacon.position.set(1.7, 1.48, -0.2);
  bridge.add(faultBeacon);
  addPart(new THREE.BoxGeometry(2.45, 1.45, 2.45), null, bridge, 1.7, 1.85, -0.2, amberWireMat);

  const failPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.76),
    new THREE.MeshStandardMaterial({
      map: createPlaqueTexture('DISK-PRESSURE WRITER', 'ENOSPC FAULT KEPT VISIBLE UNTIL FIXED', 'FAULT · AMBER', '#f0500f', true),
      clippingPlanes: [sectionPlane]
    })
  );
  failPlaque.position.set(1.7, 2.85, -0.2);
  failPlaque.rotation.y = -0.35;
  bridge.add(failPlaque);

  // ============================================================================
  // WING 05: EAST WING CATHEDRAL — THE LIVING 3D BLUEPRINT (x = +15.2, z = -3.2)
  // ============================================================================
  const eastAtrium = new THREE.Group();
  eastAtrium.position.set(15.2, 0, -3.2);
  pavilion.add(eastAtrium);

  // Soaring 1:1 3D Architectural Wireframe Arches & Vault Ribs (Zero fake solid walls!)
  for (let z = -7.5; z <= 7.5; z += 3.0) {
    addPart(new THREE.BoxGeometry(12.2, 5.2, 0.18), null, eastAtrium, 0, 2.6, z, dashedBlueprintMat);
  }
  addPart(new THREE.BoxGeometry(12.4, 0.35, 15.2), null, eastAtrium, 0, 5.1, 0, cyanWireMat);

  // Subsystem A (West side of Atrium): The Convex State Vault (3D Wireframe Cylindrical Vault Door & Sync Rings)
  addPart(new THREE.CylinderGeometry(1.9, 1.9, 0.42, 32), null, eastAtrium, -3.8, 2.2, -3.5, cyanWireMat, 0, 0, Math.PI / 2);
  addPart(new THREE.CylinderGeometry(1.2, 1.2, 0.52, 24), null, eastAtrium, -3.8, 2.2, -3.5, inkLineMat, 0, 0, Math.PI / 2);

  // Subsystem B (East side of Atrium): Four 4.6m Rust Memory Towers (core, index, salience, consolidation)
  for (let i = 0; i < 4; i++) {
    const tz = -5.2 + i * 3.4;
    addPart(new THREE.BoxGeometry(1.85, 4.4, 1.85), null, eastAtrium, 2.6, 2.2, tz, inkLineMat);
    for (let h = 0.8; h <= 3.8; h += 1.0) {
      addPart(new THREE.BoxGeometry(1.65, 0.1, 1.65), null, eastAtrium, 2.6, h, tz, cyanWireMat);
    }
  }

  // Subsystem C (Center/South of Atrium): Media Atelier Wireframe Camera Rig + 1 Solid Brushed-Chrome Preview Slab
  addPart(new THREE.CylinderGeometry(2.6, 2.6, 0.25, 28), null, eastAtrium, -1.2, 3.9, 3.2, cyanWireMat);
  addPart(new RoundedBoxGeometry(1.85, 1.15, 0.16, 2, 0.04), brushedSilver, eastAtrium, -2.4, 1.75, 3.2, inkLineMat, 0, 0.45, 0);
  addPart(new THREE.BoxGeometry(1.62, 0.92, 0.04), cyanEmissiveMat, eastAtrium, -2.35, 1.75, 3.26, null, 0, 0.45, 0);

  // ============================================================================
  // WING 06: SOUTH-EAST HORIZON TERRACE — THE DISPATCH MONOLITH (x = +14.5, z = +11.5)
  // ============================================================================
  const terrace = new THREE.Group();
  terrace.position.set(14.5, 0, 11.5);
  pavilion.add(terrace);

  // 3D Wireframe Outbound Delivery Portals along East & South Perimeter (Twenty CRM, Listmonk, Chatwoot)
  for (let i = 0; i < 3; i++) {
    const px = -3.8 + i * 3.8;
    addPart(new THREE.BoxGeometry(2.8, 3.6, 0.24), null, terrace, px, 1.8, 4.8, dashedBlueprintMat);
    addPart(new THREE.BoxGeometry(2.5, 0.12, 0.28), null, terrace, px, 2.4, 4.8, cyanWireMat);
  }

  // Centerpiece Solid Brushed-Steel & Optical-Glass SQLite Reservation Monolith
  const monolith = new THREE.Group();
  monolith.position.set(-4.6, 0, -0.3);
  monolith.rotation.y = 0.55;
  terrace.add(monolith);

  addPart(new RoundedBoxGeometry(1.85, 1.35, 1.35, 3, 0.06), brushedSilver, monolith, 0, 0.675, 0, inkLineMat);
  addPart(new RoundedBoxGeometry(1.95, 0.14, 1.45, 3, 0.04), polishedChrome, monolith, 0, 1.4, 0, inkLineMat, -0.18, 0, 0);
  addPart(new RoundedBoxGeometry(1.65, 0.06, 1.15, 2, 0.02), cyanEmissiveMat, monolith, 0, 1.48, 0.02, null, -0.18, 0, 0);
  addPart(new RoundedBoxGeometry(1.75, 1.15, 0.18, 3, 0.05), opticalGlass, monolith, 0, 2.02, -0.38, cyanWireMat);

  // Courtyard Reflecting Basin between West Entry Pavilion and East Terrace
  const basinGlass = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 6.8), opticalGlass);
  basinGlass.rotation.x = -Math.PI / 2;
  basinGlass.position.set(0, 0.03, 11.5);
  pavilion.add(basinGlass);

  // ============================================================================
  // SMOOTH CAMERA CURVE, HEAD-TURN PARALLAX, HUD & DOSSIER CONTROLLER
  // ============================================================================
  const capNo = document.querySelector('#cap-no');
  const capKicker = document.querySelector('#cap-kicker');
  const capBadge = document.querySelector('#cap-badge');
  const capTitle = document.querySelector('#cap-title');
  const capBody = document.querySelector('#cap-body');

  const spotPin = document.querySelector('#spot-pin');
  const spotNo = document.querySelector('#spot-no');
  const spotTitle = document.querySelector('#spot-title');
  const spotSub = document.querySelector('#spot-sub');

  const rulerFill = document.querySelector('#ruler-fill');
  const countNow = document.querySelector('#count-now');
  const countPct = document.querySelector('#count-pct');
  const railButtons = Array.from(document.querySelectorAll('.rail-stop'));

  const dossier = document.querySelector('#dossier');
  const dossierNo = document.querySelector('#dossier-no');
  const dossierTitle = document.querySelector('#dossier-title');
  const dossierMeta = document.querySelector('#dossier-meta');
  const dossierText = document.querySelector('#dossier-text');
  const dossierFacts = document.querySelector('#dossier-facts');
  const dossierLink = document.querySelector('#dossier-link');

  let compact = false;
  let mix = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let scrollProgress = 0;
  let smoothScroll = 0;
  let activeStopIndex = -1;
  let visible = true;
  let frame = 0;
  let last = performance.now();
  let elapsed = 0;

  const lightBgColor = new THREE.Color(0xefebe2);
  const darkBgColor = new THREE.Color(0x0f1318);
  const currentBgColor = new THREE.Color(0xefebe2);

  const camPosVec = new THREE.Vector3();
  const camLookVec = new THREE.Vector3();
  const planUp = new THREE.Vector3(0, 0, -1);
  const walkUp = new THREE.Vector3(0, 1, 0);
  const currentUp = new THREE.Vector3(0, 0, -1);
  const projVec = new THREE.Vector3();

  function scrollToStop(idx) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const targetProgress = THREE.MathUtils.clamp(idx / (STOPS.length - 1), 0, 1);
    const targetTop = Math.round(targetProgress * maxScroll);
    scrollProgress = targetProgress;
    smoothScroll = targetProgress;
    applyActiveStopDOM(idx);
    window.scrollTo({ top: targetTop, behavior: 'auto' });
    schedule();
  }

  document.querySelector('#enter-walk')?.addEventListener('click', () => scrollToStop(1));
  document.querySelector('#next-stop')?.addEventListener('click', () => {
    const next = Math.min(STOPS.length - 1, Math.max(1, activeStopIndex + 1));
    scrollToStop(next);
  });

  railButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.stop || 0);
      scrollToStop(idx);
    });
  });

  function openDossierForStop(idx) {
    const d = STOPS[idx].dossier;
    dossierNo.textContent = d.no;
    dossierTitle.textContent = d.title;
    dossierMeta.textContent = d.meta;
    dossierText.textContent = d.text;
    dossierFacts.innerHTML = d.facts
      .map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`)
      .join('');
    dossierLink.href = d.link;
    dossier.classList.add('is-open');
    dossier.setAttribute('aria-hidden', 'false');
  }

  function closeDossier() {
    dossier.classList.remove('is-open');
    dossier.setAttribute('aria-hidden', 'true');
  }

  document.querySelector('#open-spec')?.addEventListener('click', () => {
    openDossierForStop(Math.max(0, activeStopIndex));
  });
  document.querySelector('#close-spec')?.addEventListener('click', closeDossier);

  spotPin.addEventListener('click', () => {
    const s = STOPS[Math.max(0, activeStopIndex)];
    if (typeof s.spot.targetStop === 'number') {
      scrollToStop(s.spot.targetStop);
    } else {
      openDossierForStop(Math.max(0, activeStopIndex));
    }
  });

  function updateScrollTarget() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const nextProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    if (Math.abs(nextProgress - scrollProgress) > 0.08) {
      smoothScroll = nextProgress;
    }
    scrollProgress = nextProgress;
    schedule();
  }

  window.addEventListener('scroll', updateScrollTarget, { passive: true });

  function applyActiveStopDOM(idx) {
    if (idx === activeStopIndex) return;
    activeStopIndex = idx;
    const s = STOPS[idx];

    document.body.dataset.mode = s.mode;
    document.body.dataset.stop = String(idx);

    capNo.textContent = s.no;
    capKicker.textContent = s.kicker;
    capBadge.textContent = s.badge;
    capBadge.className = `room-caption__badge ${s.badgeClass}`;
    capTitle.textContent = s.title;
    capBody.textContent = s.body;

    spotNo.textContent = s.spot.no;
    spotTitle.textContent = s.spot.title;
    spotSub.textContent = s.spot.sub;
    spotPin.classList.toggle('amber', Boolean(s.spot.amber));

    countNow.textContent = s.no;
    railButtons.forEach((b, i) => b.classList.toggle('is-active', i === idx));

    if (dossier.classList.contains('is-open')) {
      openDossierForStop(idx);
    }
  }

  function projectHotspot(spot, width, height, hide) {
    if (hide || width < 760) {
      spotPin.style.opacity = '0';
      spotPin.style.transform = 'translate3d(-999px, -999px, 0)';
      return;
    }
    projVec.set(spot.pos[0], spot.pos[1], spot.pos[2]);
    projVec.project(camera);
    if (projVec.z > 1 || projVec.z < -1) {
      spotPin.style.opacity = '0';
      spotPin.style.transform = 'translate3d(-999px, -999px, 0)';
      return;
    }
    const sx = (projVec.x * 0.5 + 0.5) * width;
    const sy = (-projVec.y * 0.5 + 0.5) * height;
    const minX = activeStopIndex === 0 ? 480 : 120;
    const clampedX = THREE.MathUtils.clamp(sx, minX, width - 290);
    const clampedY = THREE.MathUtils.clamp(sy, 96, height - 180);
    spotPin.style.opacity = '1';
    spotPin.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
  }

  function resize() {
    const { width, height } = sceneHost.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    schedule();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(sceneHost);

  function schedule() {
    if (!frame && visible && !document.hidden) {
      frame = requestAnimationFrame(render);
    }
  }

  function render(now) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused) elapsed += dt;

    if (paused || Math.abs(scrollProgress - smoothScroll) > 0.14) {
      smoothScroll = scrollProgress;
    } else {
      smoothScroll = THREE.MathUtils.damp(smoothScroll, scrollProgress, 8.5, dt);
    }

    smoothPointerX = THREE.MathUtils.damp(smoothPointerX, pointerX, 6.0, dt);
    smoothPointerY = THREE.MathUtils.damp(smoothPointerY, pointerY, 6.0, dt);

    const pct = Math.round(smoothScroll * 100);
    countPct.textContent = `${pct}%`;
    rulerFill.style.height = `${pct}%`;

    const scaled = smoothScroll * (STOPS.length - 1);
    const segIdx = Math.min(STOPS.length - 2, Math.max(0, Math.floor(scaled)));
    const segT = scaled - segIdx;
    const smoothT = segT * segT * (3 - 2 * segT);

    const stopA = STOPS[segIdx];
    const stopB = STOPS[segIdx + 1];
    const nearestIdx = Math.round(scaled);
    applyActiveStopDOM(nearestIdx);

    // IMPORTANT: On Stop 0 (Plan View), mouse parallax is 0 so the architectural sheet never wobbles awkwardly!
    // At eye level (Stops 1..6), mouse gently turns the camera look target like turning your head.
    const eyeLevelFactor = THREE.MathUtils.smoothstep(scaled, 0.65, 1.25);
    const headYawX = smoothPointerX * 1.15 * eyeLevelFactor;
    const headPitchY = smoothPointerY * 0.55 * eyeLevelFactor;

    camPosVec.set(
      THREE.MathUtils.lerp(stopA.camPos[0], stopB.camPos[0], smoothT),
      THREE.MathUtils.lerp(stopA.camPos[1], stopB.camPos[1], smoothT),
      THREE.MathUtils.lerp(stopA.camPos[2], stopB.camPos[2], smoothT)
    );
    camLookVec.set(
      THREE.MathUtils.lerp(stopA.camLook[0], stopB.camLook[0], smoothT) + headYawX,
      THREE.MathUtils.lerp(stopA.camLook[1], stopB.camLook[1], smoothT) - headPitchY,
      THREE.MathUtils.lerp(stopA.camLook[2], stopB.camLook[2], smoothT)
    );

    // Smoothly transition camera.up from (0,0,-1) in top-down plan view to (0,1,0) in 3D walkthrough
    const upBlend = THREE.MathUtils.smoothstep(scaled, 0.0, 0.85);
    currentUp.copy(planUp).lerp(walkUp, upBlend).normalize();
    camera.up.copy(currentUp);

    camera.position.copy(camPosVec);
    camera.lookAt(camLookVec);

    const nextFov = THREE.MathUtils.lerp(stopA.fov, stopB.fov, smoothT);
    if (Math.abs(camera.fov - nextFov) > 0.05) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }

    // Horizontal Section Cut height (1.22m on Plan Sheet -> 8.5m in 3D Pavilion)
    sectionPlane.constant = THREE.MathUtils.lerp(stopA.cutHeight, stopB.cutHeight, smoothT);

    // Dark Obsidian Polarity Shift when inside Wing 03 (The Engine Rotunda)
    const darkWeight = (stopA.mode === 'dark' ? 1 - smoothT : 0) + (stopB.mode === 'dark' ? smoothT : 0);
    currentBgColor.copy(lightBgColor).lerp(darkBgColor, darkWeight);
    scene.background.copy(currentBgColor);
    scene.fog.color.copy(currentBgColor);
    hemiLight.intensity = THREE.MathUtils.lerp(2.5, 0.7, darkWeight);
    sun.intensity = THREE.MathUtils.lerp(4.0, 1.0, darkWeight);
    rotundaLight.intensity = THREE.MathUtils.lerp(3.0, 8.5, darkWeight);

    // Animate 3-Layer Assembly Reactor inside the Central Rotunda
    const targetAssemble = compact ? 1 : 0;
    mix = paused ? targetAssemble : THREE.MathUtils.damp(mix, targetAssemble, 5, dt);
    for (let i = 0; i < layers.length; i++) {
      const exploded = -1.18 + i * 1.18;
      const closed = -0.58 + i * 0.44;
      layers[i].position.y = THREE.MathUtils.lerp(exploded, closed, mix);
      layers[i].position.x = (1 - mix) * (i - 1) * 0.15;
      layers[i].rotation.y = (1 - mix) * (i - 1) * 0.06;
    }
    rails.forEach((r) => {
      r.scale.y = THREE.MathUtils.lerp(1, 0.48, mix);
      r.position.y = THREE.MathUtils.lerp(-0.15, -0.2, mix);
    });

    const floatOffset = paused ? 0 : Math.sin(elapsed * 1.1) * 0.04;
    machine.position.y = 1.65 + floatOffset;
    machine.rotation.y = -0.45 + (paused ? 0 : Math.sin(elapsed * 0.35) * 0.06);

    // Pulse the Burnt Amber fault light on the Proving Skybridge
    if (!paused) {
      const pulse = 0.65 + 0.35 * Math.sin(elapsed * 4.2);
      amberFaultMat.emissiveIntensity = 1.5 + pulse * 1.4;
      faultLight.intensity = 2.4 + pulse * 2.4;
    }

    const { width, height } = sceneHost.getBoundingClientRect();
    projectHotspot(STOPS[nearestIdx].spot, width, height, nearestIdx === 6);

    renderer.render(scene, camera);

    const stillScrolling = Math.abs(smoothScroll - scrollProgress) > 0.0005;
    const stillAssembling = Math.abs(mix - targetAssemble) > 0.002;
    const stillTurning = Math.abs(smoothPointerX - pointerX) > 0.001 || Math.abs(smoothPointerY - pointerY) > 0.001;
    if (!paused || stillScrolling || stillAssembling || stillTurning) {
      schedule();
    }
  }

  sceneHost.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const r = sceneHost.getBoundingClientRect();
    pointerX = (event.clientX - r.left) / r.width - 0.5;
    pointerY = (event.clientY - r.top) / r.height - 0.5;
    schedule();
  });
  sceneHost.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    schedule();
  });

  assemble.addEventListener('click', () => {
    compact = !compact;
    assemble.setAttribute('aria-pressed', String(compact));
    assemble.innerHTML = compact ? 'Take it apart <span>−</span>' : 'Bring it together <span>＋</span>';
    schedule();
  });

  motion.addEventListener('click', () => {
    paused = !paused;
    motion.textContent = paused ? 'Resume motion' : 'Pause motion';
    motion.setAttribute('aria-pressed', String(paused));
    last = performance.now();
    schedule();
  });

  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      paused = true;
      motion.textContent = 'Resume motion';
      motion.setAttribute('aria-pressed', 'true');
      schedule();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      last = performance.now();
      schedule();
    }
  });

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    sceneHost.classList.remove('scene-ready');
    document.querySelector('#scene-status').textContent = 'Graphics paused';
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    sceneHost.classList.add('scene-ready');
    schedule();
  });

  sceneHost.classList.add('scene-ready');
  updateScrollTarget();
  applyActiveStopDOM(0);
  resize();
  schedule();
} catch {
  document.querySelector('#scene-status').textContent = 'Static material study';
  assemble.disabled = true;
  motion.disabled = true;
}

// ============================================================================
// WAITLIST, SHARE & REMOVAL HANDLERS (Preserved for SQLite API & Tests)
// ============================================================================
document.querySelectorAll('form button[type=submit]').forEach((button) => {
  button.disabled = false;
});
const form = document.querySelector('#waitlist');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const status = document.querySelector('#form-status');
  button.disabled = true;
  status.textContent = 'Saving your seat…';
  try {
    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(
        response.status === 429
          ? 'Please wait a few minutes and try again.'
          : 'We couldn’t save that. Check your email and consent, then try again.'
      );
    }
    const result = await response.json();
    status.textContent = result.removalCode
      ? `Saved on this computer. No email sent. Keep your removal code: ${result.removalCode}`
      : 'Your request is recorded on this computer. No email sent.';
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Connection lost. Please try again.';
  } finally {
    button.disabled = false;
  }
});

const shareData = {
  title: 'Aegntic — Prompts die in chat. Systems ship.',
  text: 'Walk inside the Aegntic OS v2 architecture: built systems in brushed steel and optical glass, upcoming systems in 1:1 3D blueprint.',
  url: 'https://build.aegntic.ai/'
};
async function copyLink() {
  const status = document.querySelector('#share-status');
  try {
    await navigator.clipboard.writeText(shareData.url);
    status.textContent = 'Build link copied.';
  } catch {
    status.textContent = `Share this link: ${shareData.url}`;
  }
}
document.querySelector('#copy').addEventListener('click', copyLink);
document.querySelector('#share').addEventListener('click', async () => {
  if (!navigator.share) {
    await copyLink();
    return;
  }
  try {
    await navigator.share(shareData);
    document.querySelector('#share-status').textContent = 'Thanks for passing it on.';
  } catch (error) {
    if (error.name !== 'AbortError') await copyLink();
  }
});
document.querySelector('#remove').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#removal-status');
  try {
    const response = await fetch('/api/waitlist/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: document.querySelector('#removal').value.trim() })
    });
    if (!response.ok) throw new Error('Removal failed. Check the code and try again.');
    status.textContent = 'Any signup matching that code has been removed.';
  } catch (error) {
    status.textContent = error.message;
  }
});
