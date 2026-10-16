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
try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xeeefec, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  sceneHost.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
  camera.position.set(7, 4.6, 8.3);
  camera.lookAt(0, .1, 0);
  const studio = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .04);
  scene.environment = environment.texture;
  studio.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x74818b, 3));
  const sun = new THREE.DirectionalLight(0xfffdf8, 5);
  sun.position.set(-3, 8, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  sun.shadow.bias = -.001;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc6dbf4, 3);
  fill.position.set(5, 2, -4); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x617168, opacity: .14 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.1; floor.receiveShadow = true; scene.add(floor);
  const machine = new THREE.Group();
  machine.rotation.y = -.36; machine.rotation.z = -.035; scene.add(machine);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xcdd4da, metalness: 1, roughness: .18 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xe4e7e8, metalness: .82, roughness: .26 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x364757, metalness: .75, roughness: .25 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xe7edf4, metalness: .08, roughness: .12, transmission: .86, thickness: .5, ior: 1.48, clearcoat: 1, attenuationColor: new THREE.Color(0x95a8bc), attenuationDistance: 3 });
  const core = new THREE.MeshStandardMaterial({ color: 0xb5c9df, emissive: 0x72899f, emissiveIntensity: .2, metalness: .65, roughness: .25 });
  const layers = [];
  function box(w, h, d, material, parent, x = 0, y = 0, z = 0, radius = .06) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  for (let i = 0; i < 3; i++) {
    const layer = new THREE.Group(); machine.add(layer);
    box(3.25, .13, 2.6, chrome, layer, 0, -.13, 0);
    box(3.08, .2, 2.45, i === 1 ? glass : silver, layer, 0, 0, 0);
    if (i !== 1) box(2.93, .025, 2.3, glass, layer, 0, .12, 0);
    for (const x of [-1.36, 1.36]) for (const z of [-1.04, 1.04]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .05, 20), dark);
      bolt.position.set(x, .145, z); layer.add(bolt);
    }
    layers.push(layer);
  }
  box(1.5, .44, 1.23, dark, layers[0], .1, .33, .06, .09);
  box(1.32, .08, 1.1, core, layers[0], .1, .59, .06);
  for (let i = 0; i < 13; i++) box(.055, .24, 1.04, chrome, layers[0], -.5 + i * .095, .44, .06, .01);
  for (let i = 0; i < 5; i++) box(.42, .055, .65, dark, layers[1], -.95 + i * .46, .15, -.5, .02);
  for (let i = 0; i < 11; i++) box(.055, .055, .5, chrome, layers[1], -.8 + i * .16, .17, .6, .01);
  // A glass enclosure, framed with slender machined rails.
  box(2.75, .48, 2.15, glass, layers[2], 0, .35, 0, .12);
  box(2.9, .075, 2.32, chrome, layers[2], 0, .63, 0);
  const labelCanvas = document.createElement('canvas'); labelCanvas.width = 768; labelCanvas.height = 256;
  const ctx = labelCanvas.getContext('2d');
  ctx.fillStyle = '#d9e0e7'; ctx.fillRect(0, 0, 768, 256);
  ctx.fillStyle = '#354557'; ctx.font = '500 90px Arial'; ctx.fillText('aegntic', 85, 145);
  ctx.font = '22px Arial'; ctx.fillText('A S S E M B L Y   /   W O R K   I N   P R O G R E S S', 85, 205);
  const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.58, .53), new THREE.MeshStandardMaterial({ map: labelTexture, roughness: .6, metalness: .3 }));
  label.rotation.x = -Math.PI / 2; label.position.set(0, .672, 0); layers[2].add(label);
  const rails = [];
  for (const x of [-1.27, 1.27]) for (const z of [-.94, .94]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 3.15, 16), chrome);
    rail.position.set(x, -.15, z); machine.add(rail); rails.push(rail);
  }
  let compact = false, mix = 0, targetX = 0, targetY = 0, visible = true, frame = 0;
  let last = performance.now(), elapsed = 0;
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
  observer.observe(sceneHost);
  function resize() {
    const { width, height } = sceneHost.getBoundingClientRect();
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    if (width < 500) { camera.position.set(8.4, 5.3, 10); camera.lookAt(0, .05, 0); }
    else { camera.position.set(7, 4.6, 8.3); camera.lookAt(0, .1, 0); }
    schedule();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(sceneHost);
  function schedule() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); }
  function render(now) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, .04); last = now;
    if (!paused) elapsed += dt;
    const target = compact ? 1 : 0;
    mix = paused ? target : THREE.MathUtils.damp(mix, target, 5, dt);
    for (let i = 0; i < layers.length; i++) {
      const exploded = -1.35 + i * 1.35, closed = -.7 + i * .48;
      layers[i].position.y = THREE.MathUtils.lerp(exploded, closed, mix);
      layers[i].position.x = (1 - mix) * (i - 1) * .18;
      layers[i].rotation.y = (1 - mix) * (i - 1) * .065;
    }
    rails.forEach(r => { r.scale.y = THREE.MathUtils.lerp(1, .48, mix); r.position.y = THREE.MathUtils.lerp(-.15, -.2, mix); });
    const float = paused ? 0 : Math.sin(elapsed * .5) * .045;
    machine.position.y = float;
    machine.rotation.y = THREE.MathUtils.damp(machine.rotation.y, -.36 + targetX * .18, 4, dt);
    machine.rotation.x = THREE.MathUtils.damp(machine.rotation.x, targetY * .06, 4, dt);
    renderer.render(scene, camera);
    if (!paused || Math.abs(mix - target) > .002) schedule();
  }
  sceneHost.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const r = sceneHost.getBoundingClientRect();
    targetX = (event.clientX - r.left) / r.width - .5; targetY = (event.clientY - r.top) / r.height - .5; schedule();
  });
  sceneHost.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; schedule(); });
  assemble.addEventListener('click', () => {
    compact = !compact; assemble.setAttribute('aria-pressed', String(compact));
    assemble.innerHTML = compact ? 'Take it apart <span>−</span>' : 'Bring it together <span>＋</span>'; schedule();
  });
  motion.addEventListener('click', () => {
    paused = !paused; motion.textContent = paused ? 'Resume motion' : 'Pause motion'; motion.setAttribute('aria-pressed', String(paused)); last = performance.now(); schedule();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { paused = true; motion.textContent = 'Resume motion'; motion.setAttribute('aria-pressed', 'true'); schedule(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); schedule(); } });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); sceneHost.classList.remove('scene-ready'); document.querySelector('#scene-status').textContent = 'Material study / graphics paused'; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { sceneHost.classList.add('scene-ready'); schedule(); });
  sceneHost.classList.add('scene-ready'); resize(); schedule();
} catch {
  document.querySelector('#scene-status').textContent = 'Static material study';
  assemble.disabled = true; motion.disabled = true;
}

document.querySelectorAll('form button[type=submit]').forEach(button => { button.disabled = false; });
const form = document.querySelector('#waitlist');
form.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('button'); const status = document.querySelector('#form-status');
  button.disabled = true; status.textContent = 'Saving your seat…';
  try {
    const data = Object.fromEntries(new FormData(form)); data.consent = form.elements.consent.checked;
    const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(response.status === 429 ? 'Please wait a few minutes and try again.' : 'We couldn’t save that. Check your email and consent, then try again.');
    const result = await response.json();
    status.textContent = result.removalCode ? `Saved on this computer. No email sent. Keep your removal code: ${result.removalCode}` : 'Your request is recorded on this computer. No email sent.';
    form.reset();
  } catch (error) { status.textContent = error.message || 'Connection lost. Please try again.'; }
  finally { button.disabled = false; }
});
const shareData = { title: 'Aegntic — watch it come together', text: 'An agent workspace, built in public. Watch an idea become a working thing.', url: 'https://github.com/aegntic/aegntic-os-v2' };
async function copyLink() {
  const status = document.querySelector('#share-status');
  try { await navigator.clipboard.writeText(shareData.url); status.textContent = 'Build link copied.'; }
  catch { status.textContent = `Share this link: ${shareData.url}`; }
}
document.querySelector('#copy').addEventListener('click', copyLink);
document.querySelector('#share').addEventListener('click', async () => {
  if (!navigator.share) { await copyLink(); return; }
  try { await navigator.share(shareData); document.querySelector('#share-status').textContent = 'Thanks for passing it on.'; }
  catch (error) { if (error.name !== 'AbortError') await copyLink(); }
});
document.querySelector('#remove').addEventListener('submit', async event => {
  event.preventDefault(); const status = document.querySelector('#removal-status');
  try {
    const response = await fetch('/api/waitlist/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: document.querySelector('#removal').value.trim() }) });
    if (!response.ok) throw new Error('Removal failed. Check the code and try again.');
    status.textContent = 'Any signup matching that code has been removed.';
  } catch (error) { status.textContent = error.message; }
});
