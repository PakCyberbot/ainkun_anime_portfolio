/* Only the opening/content boundary is a panel transition; content scrolls normally. */
(() => {
  'use strict';
  const hero = document.querySelector('#home');
  const chapters = document.querySelector('#chapters');
  const cue = document.querySelector('.scroll-cue');
  if (!hero || !chapters) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 620;
  let frame = 0;
  let active = false;
  let destination = 'content';
  let keyboard = false;
  let cooldown = 0;
  const headerHeight = () => window.innerWidth <= 760 ? 124 : 0;
  const boundary = () => Math.max(0, hero.getBoundingClientRect().bottom + window.scrollY - headerHeight());
  const target = () => destination === 'home' ? 0 : boundary();
  const ignored = event => event.target.closest('dialog, .sidebar, .creator-transition, input, textarea, select, [contenteditable="true"]') ||
    document.body.classList.contains('card-popup-open');
  const motionOff = () => reduced.matches || document.documentElement.dataset.motionPaused === 'true';

  function finish() {
    cancelAnimationFrame(frame);
    window.scrollTo({ top: target(), behavior: 'instant' });
    active = false;
    cooldown = performance.now() + 180;
    if (keyboard) (destination === 'home' ? hero : chapters).focus({ preventScroll: true });
  }
  function transition(to, fromKeyboard = false) {
    if (active) return;
    destination = to;
    keyboard = fromKeyboard;
    active = true;
    if (to === 'content') chapters.classList.add('revealed');
    if (motionOff()) { finish(); return; }
    const startY = window.scrollY;
    const started = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: startY + (target() - startY) * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else finish();
    }
    frame = requestAnimationFrame(step);
  }
  function crossing(delta) {
    const edge = boundary();
    const y = window.scrollY;
    // At high zoom, allow reading any hero content taller than the available screen.
    const interior = Math.max(0, edge - (window.innerHeight - headerHeight()));
    if (delta > 0 && y < edge - 2 && y >= interior - 2) return 'content';
    if (delta < 0 && y > 0 && y + delta <= edge + 2 &&
        (y >= edge - 2 || interior === 0)) return 'home';
    return null;
  }
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || ignored(event) || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (active || performance.now() < cooldown) { event.preventDefault(); return; }
    const next = crossing(delta);
    if (next) { event.preventDefault(); transition(next); }
  }, { passive: false });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || ignored(event)) return;
    // Space retains its native activation behavior on buttons and links.
    if (event.key === ' ' && event.target.closest('a, button')) return;
    const direction = event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey) ? 1
      : event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey) ? -1 : 0;
    if (!direction) return;
    if (active) { event.preventDefault(); return; }
    const next = crossing(direction * (event.key.startsWith('Arrow') ? 40 : window.innerHeight * .85));
    if (next) { event.preventDefault(); transition(next, true); }
  });
  hero.setAttribute('tabindex', '-1');
  chapters.setAttribute('tabindex', '-1');
  cue?.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); transition('content', event.detail === 0);
  });
  window.addEventListener('resize', () => { if (active) finish(); });
  reduced.addEventListener('change', () => { if (active && motionOff()) finish(); });
  function reset() { cancelAnimationFrame(frame); active = false; cooldown = 0; }
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', reset);
})();
