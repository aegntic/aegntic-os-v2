const CAPTIONS = { plan: 'A foundation you can inspect. Room for what comes next.', core: 'The local execution foundation, represented in chrome and glass.', next: 'Outlined wings represent planned work, not connected services.' };

export function initSiteUI() {
  const cleanups = [];
  const on = (target, type, handler) => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };
  const emit = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }));
  const menu = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#navigation');
  const narrow = matchMedia('(max-width: 600px)');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); navigation.hidden = narrow.matches; };
  menu.hidden = !narrow.matches;
  closeMenu();
  on(menu, 'click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    navigation.hidden = !expanded;
  });
  on(narrow, 'change', () => {
    if (!narrow.matches && document.activeElement === menu) {
      navigation.hidden = false;
      navigation.querySelector('a').focus();
    }
    menu.hidden = !narrow.matches;
    if (narrow.matches && navigation.contains(document.activeElement)) menu.focus();
    closeMenu();
  });
  on(navigation, 'click', (event) => {
    const link = event.target.closest('a');
    if (link && narrow.matches) {
      const target = document.querySelector(link.hash);
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      closeMenu();
    }
  });
  on(document, 'keydown', (event) => {
    if (event.key === 'Escape' && narrow.matches && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  const views = [...document.querySelectorAll('[data-view]')];
  const setView = (view) => {
    views.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    document.querySelector('#view-caption').textContent = CAPTIONS[view];
    emit('pavilion:view', { view });
  };
  views.forEach((button) => on(button, 'click', () => setView(button.dataset.view)));
  setView('core');
  const motion = document.querySelector('#motion');
  const quality = document.querySelector('#quality');
  quality.disabled = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = true;
  const updateMotion = () => {
    motion.setAttribute('aria-pressed', String(!paused));
    motion.textContent = paused ? 'Play ambient motion' : 'Pause ambient motion';
    motion.disabled = quality.value === 'static';
    emit('pavilion:motion', { paused });
  };
  quality.value = reduced.matches || matchMedia('(max-width: 899px)').matches || matchMedia('(pointer: coarse)').matches ? 'static' : 'standard';
  updateMotion();
  on(motion, 'click', () => { paused = !paused; updateMotion(); });
  on(quality, 'change', () => { updateMotion(); emit('pavilion:quality', { quality: quality.value }); });
  on(reduced, 'change', () => {
    if (reduced.matches) { paused = true; quality.value = 'static'; updateMotion(); emit('pavilion:quality', { quality: 'static' }); }
  });

  const form = document.querySelector('#waitlist');
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('[type=submit]');
  const cancel = document.querySelector('#cancel-signup');
  const credential = document.querySelector('#removal-credential');
  let removalCode = '';
  let pending = null;
  submit.disabled = false;
  on(cancel, 'click', () => pending?.abort());
  on(form, 'submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const request = new AbortController();
    pending = request; submit.disabled = true; cancel.hidden = false;
    status.textContent = 'Recording your interest…';
    const timeout = setTimeout(() => request.abort(), 20000);
    try {
      const fields = Object.fromEntries(new FormData(form));
      const response = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, consent: form.elements.consent.checked }), signal: request.signal
      });
      if (!response.ok) {
        status.textContent = response.status === 429
          ? 'Too many requests. Please wait a few minutes and try again.'
          : response.status === 503
            ? 'Signup service unavailable. Your request was not confirmed; try again later.'
            : 'Your signup was not confirmed. Check your email and consent, then try again.';
        return;
      }
      const result = await response.json();
      if (!result.ok || !['local', 'cloudflare-d1'].includes(result.storage)) {
        status.textContent = 'The server response could not be confirmed. Please try again later; your request may already have been recorded.';
        return;
      }
      const storage = result.storage === 'cloudflare-d1' ? 'Cloudflare D1' : 'this host’s local database';
      if (typeof result.removalCode === 'string' && /^[a-f0-9]{48}$/.test(result.removalCode)) {
        removalCode = result.removalCode;
        document.querySelector('#credential-owner').textContent = `Saved credential for ${String(fields.email).trim().toLowerCase()}`;
        document.querySelector('#saved-removal-code').textContent = removalCode;
        credential.hidden = false;
        status.textContent = `Your interest is recorded in ${storage}. No email has been sent. Save your removal credential below.`;
      } else {
        removalCode = '';
        document.querySelector('#credential-owner').textContent = '';
        document.querySelector('#saved-removal-code').textContent = '';
        credential.hidden = true;
        status.textContent = `Your interest is recorded in ${storage}. No new removal code was issued. The original removal credential for this signup is required. No email has been sent.`;
      }
      form.reset();
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'Request stopped before confirmation. It may still have reached the server. Retrying is safe, but an existing signup will not receive a new removal code.' : 'Connection interrupted before confirmation. Your request may have reached the server. Check your connection before retrying.';
    } finally {
      clearTimeout(timeout); pending = null; submit.disabled = false; cancel.hidden = true;
    }
  });
  on(document.querySelector('#download-removal'), 'click', () => {
    if (!removalCode) return;
    const contents = `Aegntic signup removal credential\n\nRemoval code: ${removalCode}\n\nUse this code in Data & removal at ${location.origin}/#privacy\nKeep it private. Anyone holding it can remove this signup.\n`;
    const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'aegntic-removal-credential.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const removeForm = document.querySelector('#remove');
  const removeButton = removeForm.querySelector('[type=submit]');
  const removalStatus = document.querySelector('#removal-status');
  let removalRequest = null;
  removeButton.disabled = false;
  on(removeForm, 'submit', async (event) => {
    event.preventDefault();
    if (removalRequest || !removeForm.reportValidity()) return;
    const request = new AbortController();
    removalRequest = request; removeButton.disabled = true;
    removalStatus.textContent = 'Removing signup…';
    const timeout = setTimeout(() => request.abort(), 20000);
    try {
      const response = await fetch('/api/waitlist/remove', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: removeForm.elements.code.value.trim() }), signal: request.signal
      });
      if (!response.ok) {
        removalStatus.textContent = response.status === 429 ? 'Too many requests. Please wait a few minutes before trying again.' : 'Removal was not confirmed. Check your code and try again.';
        return;
      }
      const result = await response.json();
      if (!result.ok) { removalStatus.textContent = 'Removal could not be confirmed. Please try again.'; return; }
      removalStatus.textContent = 'Any signup matching this code has been removed.';
      if (removeForm.elements.code.value.trim() === removalCode) {
        removalCode = ''; document.querySelector('#credential-owner').textContent = ''; document.querySelector('#saved-removal-code').textContent = ''; credential.hidden = true;
      }
      removeForm.reset();
    } catch {
      removalStatus.textContent = 'Connection interrupted before confirmation. You can safely retry removal with the same code.';
    } finally {
      clearTimeout(timeout); removalRequest = null; removeButton.disabled = false;
    }
  });
  return { destroy() { cleanups.forEach((cleanup) => cleanup()); pending?.abort(); removalRequest?.abort(); } };
}
