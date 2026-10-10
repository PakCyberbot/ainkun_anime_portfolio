const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { themeForDate } = require('../themes.js');

test('local time transitions at 05:00, 17:00, and 20:00, including midnight', () => {
  for (const [localTime, expected] of [
    ['2026-10-09T04:59:59', 'night'],
    ['2026-10-09T05:00:00', 'morning'],
    ['2026-10-09T16:59:59', 'morning'],
    ['2026-10-09T17:00:00', 'evening'],
    ['2026-10-09T19:59:59', 'evening'],
    ['2026-10-09T20:00:00', 'night'],
    ['2026-10-10T00:00:00', 'night'],
    ['2027-01-01T04:59:59', 'night'],
    ['2027-01-01T05:00:00', 'morning']
  ]) assert.equal(themeForDate(new Date(localTime)), expected, localTime);
});

function harness(localTime = '2026-10-09T12:00:00', { reduced = false, paused = false } = {}) {
  let now = localTime;
  const node = (dataset = {}) => ({ dataset, attributes: {}, listeners: {}, children: [], style: {}, offsetWidth: 1,
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, value) { this.listeners[key] = value; },
    append(child) { child.parent = this; this.children.push(child); },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
  });
  const root = node();
  root.dataset.motionPaused = String(paused);
  const buttons = ['morning', 'evening', 'night'].map(theme => node({ setTheme: theme }));
  const controls = node(), auto = node(), clock = node(), status = node(), meta = node(), stack = node();
  const selectors = { '.theme-controls': controls, '.theme-auto': auto,
    '.theme-clock': clock, '#theme-status': status, 'meta[name="theme-color"]': meta, '.scene-stack': stack };
  const listeners = {}, images = [], preloads = [];
  let tick;
  const document = { documentElement: root, hidden: false,
    querySelector: selector => selectors[selector], querySelectorAll: () => buttons,
    createElement: () => node(), head: { append: link => preloads.push(link) },
    addEventListener: (event, callback) => { listeners[event] = callback; }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../themes.js'), 'utf8'), {
    document, Intl, window: { matchMedia: () => ({ matches: reduced }) },
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } },
    Image: class { constructor() { images.push(this); } },
    setInterval: callback => { tick = callback; }, setTimeout: () => {}
  });
  listeners.DOMContentLoaded();
  return { root, buttons, controls, auto, clock, status, meta, images, preloads, stack,
    click: theme => buttons.find(button => button.dataset.setTheme === theme).listeners.click(),
    resume: () => auto.listeners.click(),
    advance: value => { now = value; tick(); },
    settle: () => new Promise(resolve => setImmediate(resolve)) };
}

test('initial state uses local time and preloads only the selected scene', () => {
  const h = harness('2026-10-09T22:30:00');
  assert.equal(h.root.dataset.theme, 'night');
  assert.equal(h.clock.textContent, '22:30 Local');
  assert.equal(h.controls.dataset.mode, 'auto');
  assert.equal(h.preloads.length, 1);
  assert.equal(h.preloads[0].href, 'assets/night-street.png');
  assert.equal(h.buttons[2].attributes['aria-pressed'], 'true');
});

test('rapid previews wait for images and the last choice wins', async () => {
  const h = harness();
  h.click('evening');
  h.click('night');
  assert.equal(h.root.dataset.theme, 'morning');
  assert.equal(h.controls.attributes['aria-busy'], 'true');
  h.images[1].onload();
  await h.settle();
  h.images[0].onload();
  await h.settle();
  assert.equal(h.root.dataset.theme, 'night');
  assert.equal(h.meta.content, '#141f2c');
  assert.equal(h.buttons.filter(b => b.attributes['aria-pressed'] === 'true').length, 1);
  assert.equal(h.controls.attributes['aria-busy'], 'false');
});

test('preview survives time changes, and Use local time restores automatic changes', async () => {
  const h = harness();
  h.click('night'); h.images[0].onload(); await h.settle();
  h.advance('2026-10-09T17:30:00');
  assert.equal(h.root.dataset.theme, 'night');
  h.resume(); h.images[1].onload(); await h.settle();
  assert.equal(h.root.dataset.theme, 'evening');
  assert.equal(h.controls.dataset.mode, 'auto');
  h.advance('2026-10-09T20:00:00'); await h.settle();
  assert.equal(h.root.dataset.theme, 'night');
});

test('failed preview preserves the previous theme and supports retry', async () => {
  const h = harness();
  h.click('evening'); h.images[0].onerror(); await h.settle();
  assert.equal(h.root.dataset.theme, 'morning');
  assert.match(h.status.textContent, /could not load/);
  h.click('evening'); h.images[1].onload(); await h.settle();
  assert.equal(h.root.dataset.theme, 'evening');
});

test('returning to automatic cancels an unfinished manual preview', async () => {
  const h = harness();
  h.click('night');
  h.resume(); h.images[1].onload(); await h.settle();
  h.images[0].onload(); await h.settle();
  assert.equal(h.root.dataset.theme, 'morning');
  assert.equal(h.auto.attributes['aria-pressed'], 'true');
});

test('a clock boundary supersedes an automatic scene still loading', async () => {
  const h = harness('2026-10-09T19:59:00');
  h.click('night'); h.images[0].onload(); await h.settle();
  h.resume(); // Evening is still loading as 20:00 local time arrives.
  h.advance('2026-10-09T20:00:00'); await h.settle();
  h.images[1].onload(); await h.settle();
  assert.equal(h.root.dataset.theme, 'night');
  assert.equal(h.controls.attributes['aria-busy'], 'false');
});

test('a new scene fades over the existing blend and stale cleanup cannot remove it', async () => {
  const h = harness();
  assert.equal(h.stack.children.length, 1);
  assert.equal(h.stack.children[0].className, 'scene-layer');
  h.click('evening'); h.images[0].onload(); await h.settle();
  const evening = h.stack.children[1];
  h.click('night'); h.images[1].onload(); await h.settle();
  const night = h.stack.children[2];
  assert.equal(night.className, 'scene-layer scene-arriving');
  assert.equal(h.stack.children.length, 3);
  assert.match(night.style.backgroundImage, /night-street/);
  evening.listeners.animationend();
  assert.deepEqual(h.stack.children, [evening, night]);
  night.listeners.animationend();
  assert.deepEqual(h.stack.children, [night]);
  evening.listeners.animationend();
  assert.deepEqual(h.stack.children, [night]);
});

test('reduced motion and paused animations replace the scene immediately', async () => {
  for (const preference of [{ reduced: true }, { paused: true }]) {
    const h = harness('2026-10-09T12:00:00', preference);
    h.click('night'); h.images[0].onload(); await h.settle();
    assert.equal(h.stack.children.length, 1);
    assert.equal(h.stack.children[0].style.opacity, '1');
    assert.equal(h.stack.children[0].className, 'scene-layer');
    assert.equal(h.stack.children[0].listeners.animationend, undefined);
  }
});

test('scene and palette wait until the new image is decoded', async () => {
  const h = harness();
  h.click('night');
  let decoded;
  h.images[0].decode = () => new Promise(resolve => { decoded = resolve; });
  h.images[0].onload(); await h.settle();
  assert.equal(h.root.dataset.theme, 'morning');
  assert.equal(h.stack.children.length, 1);
  decoded(); await h.settle();
  assert.equal(h.root.dataset.theme, 'night');
  assert.equal(h.stack.children.length, 2);
});
