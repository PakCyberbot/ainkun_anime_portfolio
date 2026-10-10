/* Static-host friendly Medium articles and the blog-only welcome host. */
(() => {
  'use strict';
  function mediumURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password &&
        (url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com')) ? url.href : '';
    } catch { return ''; }
  }
  function normalizeFeed(payload, limit = 10) {
    if (!payload || !Array.isArray(payload.posts)) throw new Error('Invalid article feed');
    const seen = new Set();
    const posts = payload.posts.flatMap(item => {
      if (!item || typeof item.title !== 'string' || !item.title.trim()) return [];
      const url = mediumURL(item.url);
      if (!url || seen.has(url)) return [];
      seen.add(url);
      const date = new Date(item.publishedAt);
      return [{ title: item.title.slice(0, 220), url,
        excerpt: typeof item.excerpt === 'string' ? item.excerpt.slice(0, 230) : '',
        image: mediumURL(item.image),
        publishedAt: Number.isFinite(date.getTime()) ? date.toISOString() : '',
        tags: Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string').slice(0, 3) : [] }];
    }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (payload.posts.length && !posts.length) throw new Error('No valid Medium articles');
    return { posts: posts.slice(0, Math.max(1, Math.min(10, Number(limit) || 10))), fetchedAt: payload.fetchedAt };
  }
  function createFeedLoader({ fetcher, url, limit, now = Date.now }) {
    let pending, saved, savedAt = 0;
    return function load(force = false) {
      if (pending) return pending;
      if (!force && saved && now() - savedAt < 300000) return Promise.resolve(saved);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      pending = (async () => {
        const response = await fetcher(url, { cache: 'no-cache', signal: controller.signal });
        if (!response.ok) throw new Error('Article feed unavailable');
        const parsed = normalizeFeed(await response.json(), limit);
        saved = parsed; savedAt = now();
        return parsed;
      })().finally(() => { clearTimeout(timer); pending = null; });
      return pending;
    };
  }
  function createVisitController({ enter, leave }) {
    let active = false, suppressed = false;
    return {
      get active() { return active; },
      sync(isBlog, explicit = false) {
        if (!isBlog) {
          suppressed = false;
          if (active) { active = false; leave(); }
        } else {
          if (explicit) suppressed = false;
          if (!active && !suppressed) { active = true; enter(); }
        }
      },
      depart() {
        suppressed = true;
        if (active) { active = false; leave(); }
      }
    };
  }
  function shouldDelayNavigation(event, link, currentURL) {
    const url = new URL(link.href, currentURL);
    const current = new URL(currentURL);
    return !event.defaultPrevented && event.button === 0 &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey &&
      !link.hasAttribute('download') && (!link.target || link.target === '_self') &&
      url.origin === current.origin && url.pathname !== current.pathname;
  }
  function createVoicePlayer(audio, onBlocked) {
    let enabled = true, generation = 0;
    const stop = () => { generation++; audio.pause(); };
    return {
      stop,
      setEnabled(value) { enabled = value; if (!value) stop(); },
      play(url) {
        stop();
        if (!enabled) return;
        const id = generation;
        audio.src = url;
        audio.volume = 0.55;
        try {
          Promise.resolve(audio.play()).then(() => {
            if (id === generation) onBlocked(false);
          }).catch(() => { if (id === generation) onBlocked(true); });
        } catch { if (id === generation) onBlocked(true); }
      }
    };
  }
  function createPortraitSwitcher({ load, render }) {
    let request = 0;
    return async theme => {
      const version = ++request;
      try {
        await load(theme);
        if (version !== request) return false;
        render(theme);
        return true;
      } catch { return false; } // Keep the previous portrait if loading fails.
    };
  }
  // The same helpers are exercised by dependency-free Node tests.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeFeed, createFeedLoader, createVisitController, createVoicePlayer, shouldDelayNavigation, createPortraitSwitcher };
  }
  if (typeof document === 'undefined') return;

  const grid = document.querySelector('#writing-grid');
  const note = document.querySelector('#blog-feed-note');
  const retry = document.querySelector('#blog-retry');
  const soundButton = document.querySelector('#blog-sound');
  const guide = document.querySelector('#blog-guide');
  const config = window.PORTFOLIO.blog;
  const loadFeed = createFeedLoader({ fetcher: window.fetch.bind(window), url: config.feed, limit: config.maxPosts });
  const node = (tag, className, text) => {
    const result = document.createElement(tag);
    result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  };
  const formatDate = value => new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Karachi'
  }).format(new Date(value));
  function renderFeed(feed) {
    const cards = feed.posts.map(item => {
      const link = node('a', 'writing-card blog-card');
      link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const art = node('div', 'blog-card-art');
      art.setAttribute('aria-hidden', 'true');
      if (item.image) {
        const image = node('img', '');
        image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
        image.referrerPolicy = 'no-referrer'; image.src = item.image;
        image.addEventListener('error', () => image.remove(), { once: true });
        art.append(image);
      }
      const copy = node('div', 'blog-card-copy');
      const meta = node('div', 'blog-card-meta');
      const date = node('time', '', item.publishedAt ? formatDate(item.publishedAt) : 'FIELD NOTES');
      if (item.publishedAt) date.dateTime = item.publishedAt;
      meta.append(node('span', '', item.tags[0] || 'SECURITY & RESEARCH'), date);
      copy.append(meta, node('h3', '', item.title), node('p', '', item.excerpt), node('span', 'text-link', 'Read on Medium ↗'));
      link.append(art, copy);
      return link;
    });
    grid.replaceChildren(...cards);
    if (!cards.length) {
      note.textContent = 'New stories will appear here when published. Explore the Medium profile above.';
    } else {
      const fetched = new Date(feed.fetchedAt);
      note.textContent = `${cards.length} recent stories` + (Number.isFinite(fetched.getTime()) ? ` · Last synced ${formatDate(feed.fetchedAt)}` : '');
    }
  }
  let loading = false;
  async function loadArticles(force = false) {
    if (loading) return;
    loading = true;
    grid.setAttribute('aria-busy', 'true'); retry.hidden = true;
    if (!grid.children.length) note.textContent = 'Opening the reading shelf…';
    try { renderFeed(await loadFeed(force)); }
    catch {
      note.textContent = grid.children.length
        ? 'Showing the articles already loaded. The latest refresh is unavailable.'
        : 'The reading shelf could not load. You can still read every story on Medium above.';
      retry.hidden = false;
    } finally { loading = false; grid.setAttribute('aria-busy', 'false'); }
  }
  retry.addEventListener('click', () => loadArticles(true));

  let soundEnabled = true, voiceBlocked = false, leaveTimer;
  try { soundEnabled = sessionStorage.getItem('ainkun-blog-sound') !== 'off'; } catch {}
  function updateSoundButton() {
    soundButton.textContent = voiceBlocked && soundEnabled ? 'Enable voice ♪' : soundEnabled ? 'Voice on ♪' : 'Voice off';
    soundButton.setAttribute('aria-pressed', String(soundEnabled && !voiceBlocked));
    soundButton.setAttribute('aria-label', voiceBlocked && soundEnabled ? 'Enable the blog host voice' : soundEnabled ? 'Mute the blog host voice' : 'Enable the blog host voice');
  }
  const audio = new Audio();
  audio.preload = 'auto';
  const voice = createVoicePlayer(audio, blocked => { voiceBlocked = blocked; updateSoundButton(); });
  voice.setEnabled(soundEnabled); updateSoundButton();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reduced.matches && document.documentElement.dataset.motionPaused !== 'true';
  const say = kind => voice.play(kind === 'hello' ? 'assets/blog/adult-female-konnichiwa.mp3' : 'assets/blog/adult-female-arigatou-gozaimasu.mp3');
  const portraits = [...guide.querySelectorAll('[data-host-theme]')];
  const portraitLoads = new Map();
  const selectPortrait = createPortraitSwitcher({
    load(theme) {
      if (!portraitLoads.has(theme)) {
        const image = portraits.find(item => item.dataset.hostTheme === theme);
        const pending = image.decode();
        portraitLoads.set(theme, pending);
        pending.catch(() => portraitLoads.delete(theme));
      }
      return portraitLoads.get(theme);
    },
    render(theme) {
      portraits.forEach(image => image.classList.toggle('is-current', image.dataset.hostTheme === theme));
    }
  });
  const syncPortrait = () => selectPortrait(document.documentElement.dataset.theme || 'morning');
  new MutationObserver(syncPortrait).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  const initialPortrait = syncPortrait();
  function bubble(japanese, roman, caption) {
    guide.querySelector('.blog-guide-jp').textContent = japanese;
    guide.querySelector('.blog-guide-roman').textContent = roman;
    guide.querySelector('.blog-guide-caption').textContent = caption;
  }
  const visit = createVisitController({
    enter() {
      clearTimeout(leaveTimer);
      guide.setAttribute('aria-hidden', 'false');
      bubble('こんにちは！', 'Konnichiwa!', 'Welcome to my reading corner.');
      guide.dataset.state = 'present';
      if (!document.hidden) say('hello');
      loadArticles();
    },
    leave() {
      clearTimeout(leaveTimer);
      bubble('ありがとうございます！', 'Arigatou gozaimasu!', 'Thanks for stopping by.');
      guide.dataset.state = motionAllowed() ? 'leaving' : 'hidden';
      if (!document.hidden) say('bye');
      leaveTimer = setTimeout(() => {
        guide.dataset.state = 'hidden'; guide.setAttribute('aria-hidden', 'true');
      }, motionAllowed() ? 1750 : 0);
    }
  });
  soundButton.addEventListener('click', () => {
    soundEnabled = voiceBlocked ? true : !soundEnabled;
    voiceBlocked = false;
    voice.setEnabled(soundEnabled);
    try { sessionStorage.setItem('ainkun-blog-sound', soundEnabled ? 'on' : 'off'); } catch {}
    updateSoundButton();
    if (soundEnabled && visit.active) say('hello');
  });
  let navigationTimer;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button > 0) return;
    const url = new URL(link.href, window.location.href);
    const samePage = url.origin === window.location.origin && url.pathname === window.location.pathname;
    if (samePage) return;
    if (visit.active || navigationTimer) {
      if (shouldDelayNavigation(event, link, window.location.href)) {
        // Let the goodbye finish before following ordinary portfolio links.
        event.preventDefault();
        clearTimeout(navigationTimer);
        navigationTimer = setTimeout(() => window.location.assign(url.href),
          motionAllowed() || soundEnabled ? 1750 : 0);
      }
      visit.depart(); // External/new-tab links and modifier keys retain native behavior.
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (visit.active) voice.stop(); }
    else if (!navigationTimer) visit.sync(true, true);
  });
  window.addEventListener('pagehide', () => {
    voice.stop(); clearTimeout(leaveTimer); clearTimeout(navigationTimer); navigationTimer = null;
  });
  window.addEventListener('pageshow', event => { if (event.persisted) visit.sync(true, true); });

  document.querySelector('#year').textContent = new Date().getFullYear();
  const motionButton = document.querySelector('.motion-toggle');
  let userPausedMotion = false;
  function updateMotion() {
    const paused = userPausedMotion || reduced.matches;
    document.body.classList.toggle('motion-paused', paused);
    document.documentElement.dataset.motionPaused = String(paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.disabled = reduced.matches;
    const label = reduced.matches ? 'Animations paused by your reduced-motion preference'
      : paused ? 'Resume decorative animations' : 'Pause decorative animations';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.textContent = paused ? '▷' : 'Ⅱ';
  }
  motionButton.addEventListener('click', () => { userPausedMotion = !userPausedMotion; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  updateMotion();
  // Paint the below-window pose before transitioning into the first greeting.
  initialPortrait.finally(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!document.hidden) visit.sync(true);
  })));
})();
