const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// A small DOM model checks interaction state; visual/native-dialog QA still needs a browser.
function harness({ reduced = false, paused = false } = {}) {
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
  source.rect = { left: 850, top: 230, width: 250, height: 350 };
  source.offsetWidth = 250; source.offsetHeight = 350;
  source.append(new Element('figcaption'));
  const dialog = new Element('dialog', 'card-dialog');
  dialog.id = 'analyst-card-dialog'; dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.emit('close'); };
  const dismiss = new Element('button', 'card-dismiss');
  const flight = new Element('div', 'card-flight');
  flight.rect = { left: 480, top: 80, width: 420, height: 680 };
  const flipper = new Element('div', 'card-flipper');
  const front = new Element('div', 'card-front');
  const card = new Element('article'); card.id = 'analyst-card-content';
  flipper.append(front, card); flight.append(flipper); dialog.append(dismiss, flight);
  const contact = new Element('section'); contact.id = 'contact';
  body.append(source, dialog, contact);
  document = { body, activeElement: null, createElement: tag => new Element(tag), querySelector: selector => body.querySelector(selector) };
  const preference = { matches: reduced, addEventListener() {} };
  const windowEvents = {};
  const window = { matchMedia: () => preference, addEventListener: (name, fn) => { windowEvents[name] = fn; } };
  const timers = new Map(); let nextTimer = 0;
  const context = vm.createContext({ document, window,
    getComputedStyle: node => ({ transform: node === flight ? 'matrix(0.8, 0, 0, 0.8, 50, 20)' : 'matrix3d(intermediate-flip)' }),
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(fs.readFileSync(require.resolve('../profile.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(require.resolve('../analyst-card.js'), 'utf8'), context);
  const trigger = source.querySelector('.profile-card-open');
  return { document, body, dialog, source, trigger, dismiss, flight, flipper, contact, windowEvents,
    connect: card.querySelector('.collectible-connect'),
    finish: name => flight.emit('animationend', { animationName: name }),
    timeout: () => { [...timers.values()].forEach(fn => fn()); timers.clear(); }
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

test('the contact action closes the card before navigating and moving focus', () => {
  const h = harness(); h.trigger.emit('click'); h.finish('card-fly-in');
  h.connect.emit('click');
  assert.equal(h.dialog.open, true);
  h.finish('card-fly-out');
  assert.equal(h.dialog.open, false);
  assert.equal(h.document.activeElement, h.contact);
  assert.equal(h.contact.scrollOptions.block, 'start');
});

test('resize settles an opening and completes a closing without leaving a hidden avatar', () => {
  const h = harness(); h.trigger.emit('click'); h.windowEvents.resize();
  assert.equal(h.dialog.dataset.state, 'open');
  h.dismiss.emit('click'); h.windowEvents.resize();
  assert.equal(h.dialog.open, false);
  assert.equal(h.source.classList.contains('card-source-hidden'), false);
});
