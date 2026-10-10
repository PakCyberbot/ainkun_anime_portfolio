/* Follow the visitor's device clock and local timezone. */
(() => {
  'use strict';
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  function themeForDate(date = new Date()) {
    const hour = date.getHours();
    return hour >= 5 && hour < 17 ? 'morning' : hour >= 17 && hour < 20 ? 'evening' : 'night';
  }
  // Makes the real timezone logic testable without a browser or dependencies.
  if (typeof module !== 'undefined' && module.exports) module.exports = { themeForDate };
  if (typeof document === 'undefined') return;

  const scenes = {
    morning: { image: 'assets/morning-street.png', color: '#f7f5eb', label: 'Morning' },
    evening: { image: 'assets/evening-street.png', color: '#f5e9dc', label: 'Evening' },
    night: { image: 'assets/night-street.png', color: '#141f2c', label: 'Night' }
  };
  const root = document.documentElement;
  let current = themeForDate();
  let automatic = true;
  let request = 0;
  let pending = null;
  root.dataset.theme = current;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = scenes[current].color;
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = scenes[current].image;
  document.head.append(preload);

  document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.theme-controls');
    const buttons = [...document.querySelectorAll('[data-set-theme]')];
    const autoButton = document.querySelector('.theme-auto');
    const time = document.querySelector('.theme-clock');
    const status = document.querySelector('#theme-status');
    const loaded = new Map();
    const sceneStack = document.querySelector('.scene-stack');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fadeDuration = 3200; // Matches --theme-fade-duration in theme-motion.css.
    function showScene(theme, immediate = false) {
      if (!sceneStack || sceneStack.dataset.scene === theme) return;
      sceneStack.dataset.scene = theme;
      const previous = [...sceneStack.children];
      const layer = document.createElement('div');
      layer.style.backgroundImage = `url("${scenes[theme].image}")`;
      const animated = !immediate && !reducedMotion.matches && root.dataset.motionPaused !== 'true';
      // A keyframe animation starts at zero even when the browser batches DOM changes.
      layer.className = animated ? 'scene-layer scene-arriving' : 'scene-layer';
      layer.style.opacity = '1';
      sceneStack.append(layer);
      root.dataset.scenesReady = 'true';
      const retirePrevious = () => previous.forEach(old => old.remove());
      if (animated) {
        // Preserve the current blend underneath, even when selections change mid-fade.
        layer.addEventListener('animationend', retirePrevious, { once: true });
        // Hidden tabs and interrupted animations may not emit animationend.
        setTimeout(retirePrevious, fadeDuration + 100);
      } else {
        retirePrevious();
      }
    }
    showScene(current, true);
    controls.hidden = false;

    function render() {
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === current)));
      autoButton.textContent = automatic ? 'Auto · Local' : 'Use local time';
      autoButton.setAttribute('aria-pressed', String(automatic));
      autoButton.title = automatic ? 'Following your local time' : 'Return to automatic local time';
      time.textContent = clock.format(new Date()) + ' Local';
      controls.dataset.mode = automatic ? 'auto' : 'preview';
      controls.setAttribute('aria-busy', String(pending !== null));
    }

    function loadScene(theme) {
      if (!loaded.has(theme)) {
        const promise = new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = async () => {
            try {
              if (image.decode) await image.decode();
              resolve(image);
            } catch (error) {
              reject(error);
            }
          };
          image.onerror = reject;
          image.src = scenes[theme].image;
        });
        loaded.set(theme, promise);
        promise.catch(() => loaded.delete(theme));
      }
      return loaded.get(theme);
    }

    async function select(theme, announce = true) {
      const version = ++request;
      pending = theme;
      render();
      if (announce) status.textContent = `Loading ${scenes[theme].label.toLowerCase()} scene…`;
      try {
        await loadScene(theme);
        if (version !== request) return;
        showScene(theme);
        current = theme;
        pending = null;
        root.dataset.theme = theme;
        if (meta) meta.content = scenes[theme].color;
        render();
        if (announce) status.textContent = `${scenes[theme].label} theme. ${automatic ? 'Following your local time.' : 'Preview mode. Choose Use local time to return to automatic.'}`;
      } catch {
        if (version !== request) return;
        pending = null;
        render();
        status.textContent = 'This scene could not load. Please try again.';
      }
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      automatic = false;
      select(button.dataset.setTheme);
    }));
    autoButton.addEventListener('click', () => {
      automatic = true;
      select(themeForDate());
    });
    function refresh() {
      render();
      const next = themeForDate();
      if (automatic && next !== (pending || current)) select(next);
    }
    // Refresh on the minute and immediately when returning to the page.
    setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh();
    });
    render();
  });
})();
