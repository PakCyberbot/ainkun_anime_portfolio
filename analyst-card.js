/* Editable collectible card content lives in profile.js. */
(() => {
  'use strict';
  const config = window.PORTFOLIO?.analystCard;
  const source = document.querySelector('.profile-panel');
  const dialog = document.querySelector('#analyst-card-dialog');
  if (!config || !source || !dialog || typeof dialog.showModal !== 'function') return;

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const picture = (className, src, alt) => {
    const image = element('img', className);
    image.src = src;
    image.alt = alt || '';
    image.decoding = 'async';
    return image;
  };
  const card = dialog.querySelector('#analyst-card-content');
  const header = element('header', 'collectible-header');
  const portrait = element('div', 'collectible-portrait');
  portrait.append(picture('', config.portraitImage, config.portraitImageAlt));
  const identity = element('div', 'collectible-identity');
  const name = element('h2', 'collectible-name', config.name);
  name.id = 'analyst-card-name';
  identity.append(element('span', 'collectible-stage', config.stage), name);
  const stat = element('div', 'collectible-stat');
  stat.append(element('span', '', config.statLabel), element('strong', '', config.statValue));
  const energy = element('span', 'collectible-energy');
  energy.setAttribute('aria-hidden', 'true');
  header.append(portrait, identity, stat, energy);

  const artwork = element('figure', 'collectible-artwork');
  const mainImage = picture('collectible-main-image', config.mainImage, config.mainImageAlt);
  mainImage.style.objectPosition = config.imagePosition || 'center';
  const ribbon = element('span', 'collectible-ribbon', config.type);
  const caption = element('figcaption', 'collectible-art-caption');
  const japanese = element('span', '', config.japaneseName);
  japanese.lang = 'ja';
  caption.append(element('span', '', config.role), japanese);
  artwork.append(mainImage, ribbon, caption);
  if (config.mainVideo) {
    const video = element('video', 'collectible-main-image collectible-main-video');
    video.src = config.mainVideo;
    video.poster = config.mainImage;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.disablePictureInPicture = true;
    video.style.objectPosition = config.imagePosition || 'center';
    // Keep the image underneath as a fallback and overlays above the video.
    artwork.replaceChildren(mainImage, video, ribbon, caption);
  }

  const body = element('div', 'collectible-body');
  if (config.ability) {
    const ability = element('section', 'collectible-ability');
    const heading = element('div', 'collectible-ability-heading');
    heading.append(element('span', 'collectible-label', 'ABILITY'), element('h3', '', config.ability.title));
    ability.append(heading, element('p', '', config.ability.description));
    body.append(ability);
  }
  const techniques = element('div', 'collectible-techniques');
  (config.techniques || []).forEach(item => {
    const row = element('section', 'collectible-technique');
    const symbol = element('span', 'collectible-technique-symbol', item.symbol || '◇');
    symbol.setAttribute('aria-hidden', 'true');
    const copy = element('div', 'collectible-technique-copy');
    copy.append(element('h3', '', item.title), element('p', '', item.description));
    row.append(symbol, copy, element('span', 'collectible-technique-tag', item.tag));
    techniques.append(row);
  });
  body.append(techniques);
  if (config.stats?.length) {
    const stats = element('section', 'collectible-stats');
    stats.append(element('h3', '', 'STATS'));
    const list = element('ul', 'collectible-stat-list');
    config.stats.forEach(label => list.append(element('li', '', label)));
    stats.append(list);
    body.append(stats);
  }
  const traits = element('dl', 'collectible-traits');
  (config.traits || []).forEach(item => {
    const trait = element('div', 'collectible-trait');
    trait.append(element('dt', '', item.label), element('dd', '', item.value));
    traits.append(trait);
  });
  if (config.traits?.length) body.append(traits);
  body.append(element('p', 'collectible-motto', config.motto));
  const footer = element('footer', 'collectible-footer');
  footer.append(element('span', '', config.edition), element('span', '', `${config.number} / a刀 ✦`));
  card.append(header, artwork, body, footer);

  const trigger = element('button', 'profile-card-open');
  trigger.type = 'button';
  trigger.setAttribute('aria-label', `Open ${config.name}'s researcher card`);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');
  source.append(trigger);

  const flight = dialog.querySelector('.card-flight');
  const flipper = dialog.querySelector('.card-flipper');
  const front = dialog.querySelector('.card-front');
  const dismiss = dialog.querySelector('.card-dismiss');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reduced.matches && !document.body.classList.contains('motion-paused');
  let state = 'closed';
  let timer;

  // A decorative copy flips in place; the original keeps its layout and hit area.
  const hint = element('div', 'profile-card-hint');
  const hintRotor = element('div', 'profile-hint-rotor');
  const hintFront = element('div', 'profile-hint-front');
  const hintBack = element('div', 'profile-hint-back');
  function visualClone(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('button').forEach(child => child.remove());
    clone.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
    clone.removeAttribute('id');
    return clone;
  }
  hintBack.append(visualClone(card));
  hintRotor.append(hintFront, hintBack);
  hint.append(hintRotor);
  hint.hidden = true;
  hint.setAttribute('aria-hidden', 'true');
  hint.setAttribute('inert', '');
  source.parentElement.append(hint);
  const hintInterval = 10000;
  let hintTimer;
  let hintEndTimer;
  let inView = !('IntersectionObserver' in window);

  function syncCardMedia() {
    for (const [face, visible] of [[card, dialog.open && state !== 'closed'], [hintBack, !hint.hidden]]) {
      face.querySelectorAll('video').forEach(video => {
        // cloneNode does not reliably preserve the live muted property.
        video.muted = true;
        video.volume = 0;
        if (visible && !video.hidden && motionAllowed() && !document.hidden) {
          if (video.paused) {
            try { Promise.resolve(video.play()).catch(() => {}); } catch {}
          }
        } else video.pause();
      });
    }
  }
  [card, hintBack].forEach(face => face.querySelectorAll('video').forEach(video => {
    video.addEventListener('error', () => { video.hidden = true; video.pause(); });
  }));

  function stopHint() {
    clearTimeout(hintEndTimer);
    hint.hidden = true;
    source.classList.remove('card-hint-active');
    syncCardMedia();
  }
  function hintAllowed() {
    return state === 'closed' && motionAllowed() && !document.hidden && inView;
  }
  function scheduleHint() {
    clearTimeout(hintTimer);
    if (hintAllowed()) hintTimer = setTimeout(beginHint, hintInterval);
  }
  function refreshHint() {
    stopHint();
    scheduleHint();
  }
  function beginHint() {
    if (!hintAllowed()) return;
    // Preserve the natural source size and use the same detailed reverse face.
    const style = getComputedStyle(source);
    const width = parseFloat(style.width) || source.offsetWidth;
    const height = parseFloat(style.height) || source.offsetHeight;
    hintFront.replaceChildren(visualClone(source));
    hint.style.width = `${width}px`;
    hint.style.height = `${height}px`;
    hint.style.left = `${source.offsetLeft}px`;
    hint.style.top = `${source.offsetTop}px`;
    hint.style.transform = style.transform;
    hint.style.setProperty('--hint-detail-height', `${height * 420 / width}px`);
    hint.style.setProperty('--hint-detail-scale', String(width / 420));
    hint.hidden = false;
    syncCardMedia();
    source.classList.add('card-hint-active');
    hintEndTimer = setTimeout(stopHint, 3100);
    scheduleHint(); // Ten seconds between starts, with no catch-up bursts.
  }
  hintRotor.addEventListener('animationend', event => {
    if (event.target === hintRotor && event.animationName === 'profile-hint-turn') stopHint();
  });
  document.addEventListener('visibilitychange', refreshHint);
  new MutationObserver(refreshHint).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-motion-paused']
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5;
      refreshHint();
    }, { threshold: [0, 0.5] }).observe(source);
  }
  scheduleHint();

  function setState(next) {
    state = next;
    dialog.dataset.state = next;
    syncCardMedia();
  }
  function origin() {
    // The main-page card keeps its natural responsive layout. Fit the popup
    // to that ratio before measuring its center, so neither face stretches.
    const sourceStyle = getComputedStyle(source);
    const width = parseFloat(sourceStyle.width) || source.offsetWidth;
    const height = parseFloat(sourceStyle.height) || source.offsetHeight;
    flight.style.setProperty('--analyst-card-ratio', `${width} / ${height}`);
    const from = source.getBoundingClientRect();
    const to = flight.getBoundingClientRect();
    flight.style.setProperty('--card-origin-x', `${from.left + from.width / 2 - to.left - to.width / 2}px`);
    flight.style.setProperty('--card-origin-y', `${from.top + from.height / 2 - to.top - to.height / 2}px`);
    // One scale preserves the shared aspect ratio throughout the flight.
    // Keep the front at its original layout size, then enlarge it as a unit:
    // reflowing the clone at popup width would make its image and labels jump.
    const scale = width / to.width;
    flight.style.setProperty('--card-origin-scale', String(scale));
    flight.style.setProperty('--card-origin-pose', sourceStyle.transform === 'none' ? 'rotate(0deg)' : sourceStyle.transform);
    front.style.setProperty('--card-source-width', `${width}px`);
    front.style.setProperty('--card-source-height', `${height}px`);
    front.style.setProperty('--card-face-scale', String(1 / scale));
  }
  function settleOpen() {
    if (state !== 'opening') return;
    clearTimeout(timer);
    setState('open');
  }
  function finishClose() {
    if (state === 'closed') return;
    clearTimeout(timer);
    setState('closed');
    source.classList.remove('card-source-hidden');
    document.body.classList.remove('card-popup-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (dialog.open) dialog.close();
    trigger.focus({ preventScroll: true });
    scheduleHint();
  }
  function openCard() {
    if (state !== 'closed') return;
    clearTimeout(hintTimer);
    stopHint();
    front.replaceChildren(visualClone(source));
    setState('measuring');
    document.body.classList.add('card-popup-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    origin();
    source.classList.add('card-source-hidden');
    trigger.setAttribute('aria-expanded', 'true');
    dismiss.focus({ preventScroll: true });
    if (motionAllowed()) {
      setState('opening');
      timer = setTimeout(settleOpen, 1250);
    } else {
      setState('open');
    }
  }
  function closeCard() {
    if (state === 'closed' || state === 'closing') return;
    if (!motionAllowed()) { finishClose(); return; }
    clearTimeout(timer);
    // Capture the current pose so Escape can reverse an unfinished opening smoothly.
    const currentFlight = getComputedStyle(flight).transform;
    const currentFlip = getComputedStyle(flipper).transform;
    setState('measuring');
    origin();
    flight.style.setProperty('--card-close-from', currentFlight);
    flipper.style.setProperty('--card-flip-from', currentFlip);
    setState('closing');
    timer = setTimeout(finishClose, 950);
  }
  trigger.addEventListener('click', openCard);
  dismiss.addEventListener('click', closeCard);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeCard(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeCard(); });
  dialog.addEventListener('close', () => { if (state !== 'closed') finishClose(); });
  flight.addEventListener('animationend', event => {
    if (event.target !== flight) return;
    if (state === 'opening' && event.animationName === 'card-fly-in') settleOpen();
    if (state === 'closing' && event.animationName === 'card-fly-out') finishClose();
  });
  window.addEventListener('resize', () => {
    refreshHint();
    if (state === 'opening') settleOpen();
    else if (state === 'closing') finishClose();
    if (state === 'open') origin();
  });
  reduced.addEventListener('change', () => {
    refreshHint();
    if (!reduced.matches) return;
    if (state === 'opening') settleOpen();
    else if (state === 'closing') finishClose();
  });
})();
