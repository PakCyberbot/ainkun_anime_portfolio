/* A short Japanese code-rain send-off for the creator credit on both pages. */
(() => {
  'use strict';
  const link = document.querySelector('[data-creator-link]');
  if (!link) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン探索接続';
  let overlay = null;
  let timer;

  function reset(restoreFocus = false) {
    clearTimeout(timer);
    timer = undefined;
    overlay?.remove();
    overlay = null;
    link.removeAttribute('aria-busy');
    if (restoreFocus) link.focus({ preventScroll: true });
  }

  // A document listener lets the blog's farewell start before the transition.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-creator-link]') !== link || event.defaultPrevented ||
        event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    if (reduced.matches || document.documentElement.dataset.motionPaused === 'true') return;
    event.preventDefault();
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'creator-transition';
    const rain = document.createElement('div');
    rain.className = 'creator-rain';
    rain.setAttribute('aria-hidden', 'true');
    const columns = Math.min(64, Math.max(12, Math.ceil(window.innerWidth / 28)));
    for (let i = 0; i < columns; i++) {
      const stream = document.createElement('span');
      stream.className = 'creator-rain-stream';
      stream.lang = 'ja';
      stream.style.left = `${(i + 0.5) * 100 / columns}%`;
      stream.style.setProperty('--rain-delay', `${Math.random() * 0.35}s`);
      stream.style.setProperty('--rain-duration', `${1.5 + Math.random() * 0.65}s`);
      stream.textContent = Array.from({ length: 24 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join('\n');
      rain.append(stream);
    }
    const status = document.createElement('div');
    status.className = 'creator-transition-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const emblem = document.createElement('div');
    emblem.className = 'creator-emblem';
    const logo = document.createElement('img');
    logo.src = 'pakcyberbot.png';
    logo.alt = '';
    logo.width = 120;
    logo.height = 158;
    emblem.append(logo);
    const japanese = document.createElement('span');
    japanese.lang = 'ja';
    japanese.textContent = '接続中';
    const label = document.createElement('strong');
    label.textContent = 'Connecting to PakCyberbot';
    status.append(emblem, japanese, label);
    overlay.append(rain, status);
    document.body.append(overlay);
    link.setAttribute('aria-busy', 'true');
    // Navigation does not depend on an animationend event or image/network load.
    timer = setTimeout(() => {
      try {
        window.location.assign(link.href);
        // Keep the veil during loading; recover if the browser cancels navigation.
        timer = setTimeout(() => reset(), 8000);
      } catch { reset(); }
    }, 2400);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay) { event.preventDefault(); reset(true); }
  });
  window.addEventListener('pagehide', () => reset());
  window.addEventListener('pageshow', () => reset());
  reduced.addEventListener('change', () => {
    if (reduced.matches && overlay) {
      try { window.location.assign(link.href); } finally { reset(); }
    }
  });
})();
