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
  const energy = element('span', 'collectible-energy', '◈');
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
  const traits = element('dl', 'collectible-traits');
  (config.traits || []).forEach(item => {
    const trait = element('div', 'collectible-trait');
    trait.append(element('dt', '', item.label), element('dd', '', item.value));
    traits.append(trait);
  });
  const connect = element('button', 'collectible-connect');
  connect.type = 'button';
  connect.append(element('span', '', 'CONTACT'), element('strong', '', config.contactLabel || "Let's connect"), element('span', '', '↗'));
  body.append(traits, connect, element('p', 'collectible-motto', config.motto));
  const footer = element('footer', 'collectible-footer');
  footer.append(element('span', '', config.edition), element('span', '', `${config.number} / a刀 ✦`));
  card.append(header, artwork, body, footer);

  const trigger = element('button', 'profile-card-open');
  trigger.type = 'button';
  trigger.setAttribute('aria-label', `Open ${config.name}'s analyst card`);
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
  let goToContact = false;

  function setState(next) {
    state = next;
    dialog.dataset.state = next;
  }
  function origin() {
    const from = source.getBoundingClientRect();
    const to = flight.getBoundingClientRect();
    flight.style.setProperty('--card-origin-x', `${from.left + from.width / 2 - to.left - to.width / 2}px`);
    flight.style.setProperty('--card-origin-y', `${from.top + from.height / 2 - to.top - to.height / 2}px`);
    flight.style.setProperty('--card-origin-sx', String(source.offsetWidth / to.width));
    flight.style.setProperty('--card-origin-sy', String(source.offsetHeight / to.height));
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
    if (goToContact) {
      const contact = document.querySelector('#contact');
      contact.setAttribute('tabindex', '-1');
      contact.focus({ preventScroll: true });
      contact.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'instant', block: 'start' });
      goToContact = false;
    }
  }
  function openCard() {
    if (state !== 'closed') return;
    const clone = source.cloneNode(true);
    clone.querySelectorAll('button').forEach(node => node.remove());
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.removeAttribute('id');
    front.replaceChildren(clone);
    goToContact = false;
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
  connect.addEventListener('click', () => { goToContact = true; closeCard(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeCard(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeCard(); });
  dialog.addEventListener('close', () => { if (state !== 'closed') finishClose(); });
  flight.addEventListener('animationend', event => {
    if (event.target !== flight) return;
    if (state === 'opening' && event.animationName === 'card-fly-in') settleOpen();
    if (state === 'closing' && event.animationName === 'card-fly-out') finishClose();
  });
  window.addEventListener('resize', () => {
    if (state === 'opening') settleOpen();
    else if (state === 'closing') finishClose();
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    if (state === 'opening') settleOpen();
    else if (state === 'closing') finishClose();
  });
})();
