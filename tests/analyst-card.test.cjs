const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// A small DOM model checks interaction state; visual/native-dialog QA still needs a browser.
function harness({ reduced = false, paused = false, sourceWidth = 250, sourceHeight = 350, popupWidth = 420 } = {}) {
  let document;
  class Element {
    constructor(tag = 'div', className = '') {
      this.tagName = tag;
      this.className = className;
      this.children = [];
      this.dataset = {};
      this.attributes = {};
      this.events = {};
      this.style = { setProperty(key, value) { this[key] = value; } };
      this.classList = {
        contains: name => this.className.split(' ').includes(name),
        add: name => { if (!this.classList.contains(name)) this.className += ' ' + name; },
        remove: name => { this.className = this.className.split(' ').filter(part => part !== name).join(' '); }
      };
    }
    append(...children) { children.forEach(child => { child.parent = this; this.children.push(child); }); }
    get parentElement() { return this.parent; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; if (key === 'id') delete this.id; }
    matches(selector) {
      if (selector === '[id]') return !!this.id;
      if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      return this.tagName === selector;
    }
    querySelectorAll(selector) {
      const selectors = selector.split(',').map(item => item.trim());
      return this.children.flatMap(child => [
        ...(selectors.some(s => child.matches(s)) ? [child] : []), ...child.querySelectorAll(selector)
      ]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0]; }
    addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
    emit(type, props = {}) {
      const event = { target: this, preventDefault() { this.prevented = true; }, ...props };
      (this.events[type] || []).forEach(fn => fn(event));
      return event;
    }
    cloneNode(deep) {
      const copy = new Element(this.tagName, this.className);
      copy.id = this.id;
      if (deep) this.children.forEach(child => copy.append(child.cloneNode(true)));
      return copy;
    }
    focus() { document.activeElement = this; }
    scrollIntoView(options) { this.scrollOptions = options; }
    getBoundingClientRect() { return this.rect || { left: 0, top: 0, width: 100, height: 100 }; }
  }
  const body = new Element('body', paused ? 'motion-paused' : '');
  const source = new Element('figure', 'profile-panel');
  source.rect = { left: 850, top: 230, width: sourceWidth, height: sourceHeight };
  source.offsetWidth = Math.round(sourceWidth); source.offsetHeight = Math.round(sourceHeight);
  source.offsetLeft = 0; source.offsetTop = 0;
  source.append(new Element('figcaption'));
  const dialog = new Element('dialog', 'card-dialog');
  dialog.id = 'analyst-card-dialog'; dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.emit('close'); };
  const dismiss = new Element('button', 'card-dismiss');
  const flight = new Element('div', 'card-flight');
  flight.rect = { left: 480, top: 80, width: popupWidth, height: popupWidth * 5 / 3 };
  flight.getBoundingClientRect = () => {
    const [width, height] = flight.style['--analyst-card-ratio'].split('/').map(Number);
    return { ...flight.rect, height: popupWidth * height / width };
  };
  const flipper = new Element('div', 'card-flipper');
  const front = new Element('div', 'card-front');
  const card = new Element('article'); card.id = 'analyst-card-content';
  flipper.append(front, card); flight.append(flipper); dialog.append(dismiss, flight);
  body.append(source, dialog);
  const documentEvents = {};
  document = { body, documentElement: new Element('html'), hidden: false, activeElement: null,
    addEventListener: (name, fn) => { documentEvents[name] = fn; },
    createElement: tag => new Element(tag), querySelector: selector => body.querySelector(selector) };
  let preferenceChanged;
  const preference = { matches: reduced, addEventListener: (name, fn) => { preferenceChanged = fn; } };
  let intersectionChanged;
  let motionChanged;
  class IntersectionObserver {
    constructor(fn) { intersectionChanged = fn; }
    observe() { intersectionChanged([{ isIntersecting: true, intersectionRatio: 1 }]); }
  }
  class MutationObserver {
    constructor(fn) { motionChanged = fn; }
    observe() {}
  }
  const windowEvents = {};
  const window = { IntersectionObserver, matchMedia: () => preference, addEventListener: (name, fn) => { windowEvents[name] = fn; } };
  const timers = new Map(); let nextTimer = 0; let now = 0;
  const advance = duration => {
    const end = now + duration;
    while (true) {
      const due = [...timers.entries()].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      now = due[1].at; timers.delete(due[0]); due[1].fn();
    }
    now = end;
  };
  const context = vm.createContext({ document, window, IntersectionObserver, MutationObserver,
    getComputedStyle: node => node === source
      ? { width: `${sourceWidth}px`, height: `${sourceHeight}px`, transform: 'matrix(0.9986, 0.0523, -0.0523, 0.9986, 0, 0)' }
      : { transform: node === flight ? 'matrix(0.8, 0, 0, 0.8, 50, 20)' : 'matrix3d(intermediate-flip)' },
    setTimeout: (fn, delay) => { timers.set(++nextTimer, { fn, at: now + delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(fs.readFileSync(require.resolve('../profile.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(require.resolve('../analyst-card.js'), 'utf8'), context);
  const trigger = source.querySelector('.profile-card-open');
  return { document, body, dialog, source, trigger, dismiss, flight, flipper, front, windowEvents, advance,
    hint: body.querySelector('.profile-card-hint'),
    setPaused: value => { body.classList[value ? 'add' : 'remove']('motion-paused'); motionChanged(); },
    setReduced: value => { preference.matches = value; preferenceChanged(); },
    setHidden: value => { document.hidden = value; documentEvents.visibilitychange(); },
    setInView: value => intersectionChanged([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 }]),
    finish: name => flight.emit('animationend', { animationName: name }),
    timeout: () => advance(Math.min(...[...timers.values()].map(task => task.at)) - now)
  };
}

test('opens one modal, flies from the avatar, and keeps the page locked', () => {
  const h = harness(); h.trigger.emit('click'); h.trigger.emit('click');
  assert.equal(h.dialog.open, true);
  assert.equal(h.dialog.dataset.state, 'opening');
  assert.equal(h.trigger.attributes['aria-expanded'], 'true');
  assert.equal(h.source.classList.contains('card-source-hidden'), true);
  assert.equal(h.body.classList.contains('card-popup-open'), true);
  assert.equal(h.document.activeElement, h.dismiss);
  assert.notEqual(h.flight.style['--card-origin-x'], '0px');
  h.finish('card-fly-in');
  assert.equal(h.dialog.dataset.state, 'open');
});

test('Escape during opening reverses the current pose and restores focus', () => {
  const h = harness(); h.trigger.emit('click');
  assert.equal(h.dialog.emit('cancel').prevented, true);
  assert.equal(h.dialog.dataset.state, 'closing');
  assert.match(h.flight.style['--card-close-from'], /^matrix/);
  h.finish('card-fly-out');
  assert.equal(h.dialog.open, false);
  assert.equal(h.document.activeElement, h.trigger);
  assert.equal(h.source.classList.contains('card-source-hidden'), false);
  assert.equal(h.body.classList.contains('card-popup-open'), false);
  assert.equal(h.trigger.attributes['aria-expanded'], 'false');
});

test('desktop and mobile flights preserve both dimensions and the original front layout', () => {
  for (const [sourceWidth, sourceHeight, popupWidth] of [[250.375, 350.5, 420], [165, 232, 343]]) {
    const h = harness({ sourceWidth, sourceHeight, popupWidth }); h.trigger.emit('click');
    const scale = Number(h.flight.style['--card-origin-scale']);
    const faceScale = Number(h.front.style['--card-face-scale']);
    const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.0001);
    near(h.flight.rect.width * scale, sourceWidth);
    near(h.flight.getBoundingClientRect().height * scale, sourceHeight);
    near(parseFloat(h.front.style['--card-source-width']), sourceWidth);
    near(parseFloat(h.front.style['--card-source-height']), sourceHeight);
    near(scale * faceScale, 1);
    assert.match(h.flight.style['--card-origin-pose'], /^matrix\(0.9986/);
    h.finish('card-fly-in'); h.dismiss.emit('click');
    near(Number(h.flight.style['--card-origin-scale']), scale);
  }
});

test('inside clicks stay open; outside clicks close with timeout cleanup', () => {
  const h = harness(); h.trigger.emit('click'); h.finish('card-fly-in');
  h.dialog.emit('click', { target: h.flipper });
  assert.equal(h.dialog.dataset.state, 'open');
  h.dialog.emit('click');
  assert.equal(h.dialog.dataset.state, 'closing');
  h.timeout();
  assert.equal(h.dialog.open, false);
});

test('reduced or paused motion opens and closes without waiting for animations', () => {
  for (const settings of [{ reduced: true }, { paused: true }]) {
    const h = harness(settings); h.trigger.emit('click');
    assert.equal(h.dialog.dataset.state, 'open');
    h.dismiss.emit('click');
    assert.equal(h.dialog.open, false);
    assert.equal(h.document.activeElement, h.trigger);
  }
});

test('resize settles an opening and completes a closing without leaving a hidden avatar', () => {
  const h = harness(); h.trigger.emit('click'); h.windowEvents.resize();
  assert.equal(h.dialog.dataset.state, 'open');
  h.dismiss.emit('click'); h.windowEvents.resize();
  assert.equal(h.dialog.open, false);
  assert.equal(h.source.classList.contains('card-source-hidden'), false);
});

test('the hint waits ten seconds, shows a decorative reverse, and repeats without changing layout', () => {
  const h = harness(); h.advance(9999);
  assert.equal(h.hint.hidden, true);
  h.advance(1);
  assert.equal(h.hint.hidden, false);
  assert.equal(h.source.offsetWidth, 250);
  assert.equal(h.source.offsetHeight, 350);
  assert.equal(h.hint.attributes['aria-hidden'], 'true');
  assert.equal(h.hint.attributes.inert, '');
  assert.equal(h.hint.querySelectorAll('[id]').length, 0);
  assert.equal(h.hint.querySelectorAll('button').length, 0);
  assert.ok(h.hint.querySelector('.collectible-name'));
  h.hint.querySelector('.profile-hint-rotor').emit('animationend', { animationName: 'profile-hint-turn' });
  assert.equal(h.hint.hidden, true);
  assert.equal(h.source.classList.contains('card-hint-active'), false);
  h.advance(10000);
  assert.equal(h.hint.hidden, false);
  h.advance(3000);
  assert.equal(h.hint.hidden, false); // Allow the complete three-second turn.
  h.advance(100); // Missing animationend still restores the original.
  assert.equal(h.hint.hidden, true);
});

test('clicking during a hint opens one popup and suspends hints until after closing', () => {
  const h = harness(); h.advance(10000); h.trigger.emit('click');
  assert.equal(h.hint.hidden, true);
  assert.equal(h.source.classList.contains('card-hint-active'), false);
  assert.equal(h.dialog.open, true);
  h.advance(30000);
  assert.equal(h.hint.hidden, true);
  h.dismiss.emit('click'); h.finish('card-fly-out');
  h.advance(9999); assert.equal(h.hint.hidden, true);
  h.advance(1); assert.equal(h.hint.hidden, false);
});

test('motion preferences, hidden tabs, and off-screen cards stop hints and restart a fresh interval', () => {
  for (const method of ['setPaused', 'setReduced', 'setHidden', 'setInView']) {
    const h = harness(); h.advance(10000);
    h[method](method !== 'setInView');
    assert.equal(h.hint.hidden, true);
    assert.equal(h.source.classList.contains('card-hint-active'), false);
    h.advance(30000); assert.equal(h.hint.hidden, true);
    h[method](method === 'setInView');
    h.advance(9999); assert.equal(h.hint.hidden, true);
    h.advance(1); assert.equal(h.hint.hidden, false);
  }
  for (const settings of [{ paused: true }, { reduced: true }]) {
    const h = harness(settings); h.advance(30000);
    assert.equal(h.hint.hidden, true);
  }
});
