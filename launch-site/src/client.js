import { initSiteUI } from './site-ui.js';

// Keep the hardened signup independent of the architectural experience.
initSiteUI();
const mode = document.querySelector('#tour-mode');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let tour = null;
let generation = 0;
let loading = false;
mode.value = reduced.matches ? 'static' : 'standard';
for (const control of document.querySelectorAll('#assemble, #motion')) control.disabled = true;
function readChapter(index) {
  if (!document.body.classList.contains('static-tour')) return;
  document.querySelector(`[data-step="${index}"]`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
}
document.querySelectorAll('.rail-stop').forEach(button => button.addEventListener('click', event => {
  if (document.body.classList.contains('static-tour')) { event.stopImmediatePropagation(); readChapter(button.dataset.stop); }
}));
document.querySelector('#enter-walk').addEventListener('click', event => {
  if (document.body.classList.contains('static-tour')) { event.stopImmediatePropagation(); readChapter(1); }
});

async function startTour() {
  if (tour || loading || mode.value === 'static') return;
  const attempt = ++generation;
  loading = true;
  try {
    const { initFlythrough } = await import('./flythrough.js');
    if (attempt !== generation || mode.value === 'static') return;
    tour = initFlythrough();
  } catch {
    document.body.classList.add('static-tour');
    mode.value = 'static';
    for (const control of document.querySelectorAll('#assemble, #motion')) control.disabled = true;
    const status = document.querySelector('#scene-status');
    if (status) status.textContent = 'Graphics unavailable. Read the chapter guide below.';
  } finally {
    if (attempt === generation) loading = false;
  }
}
mode.addEventListener('change', () => {
  if (!tour) startTour();
});
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    mode.value = 'static';
    document.body.classList.add('static-tour');
  }
});
startTour();
window.addEventListener('pagehide', () => {
  ++generation; loading = false;
  tour?.destroy(); tour = null;
});
window.addEventListener('pageshow', event => { if (event.persisted) startTour(); });
