const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({ height = 800, width = 1366, heroHeight = 800, reduced = false } = {}) {
  let now = 0, nextFrame = 0;
  const frames = new Map(), events = {}, keys = {};
  const element = () => ({ classList: { add() {}, contains: () => false }, setAttribute() {}, focus() { this.focused = true; } });
  const hero = element(), chapters = element();
  const cue = { addEventListener: (type, fn) => { keys.cue = fn; } };
  const preference = { matches: reduced, addEventListener: (_, fn) => { keys.motion = fn; } };
  const win = { scrollY: 0, innerWidth: width, innerHeight: height,
    matchMedia: () => preference, scrollTo: ({ top }) => { win.scrollY = top; },
    addEventListener: (type, fn) => { events[type] = fn; }
  };
  hero.getBoundingClientRect = () => ({ bottom: heroHeight + (win.innerWidth <= 760 ? 124 : 0) - win.scrollY });
  vm.runInNewContext(fs.readFileSync(require.resolve('../chapter-transition.js'), 'utf8'), {
    window: win, performance: { now: () => now },
    document: { body: element(), documentElement: { dataset: {} },
      querySelector: selector => ({ '#home': hero, '#chapters': chapters, '.scroll-cue': cue })[selector],
      addEventListener: (type, fn) => { keys[type] = fn; }
    },
    requestAnimationFrame: fn => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  const event = options => ({ target: { closest: () => null }, deltaX: 0, deltaY: 100, deltaMode: 0,
    preventDefault() { this.prevented = true; }, ...options });
  return { win, hero, chapters, events, keys, preference, frames,
    wheel(options) { const e = event(options); events.wheel(e); return e; },
    key(options) { const e = event(options); keys.keydown(e); return e; },
    advance(ms) { now += ms; const tasks = [...frames.values()]; frames.clear(); tasks.forEach(fn => fn(now)); }
  };
}

test('one wheel gesture transitions to the exact archive boundary and absorbs momentum', () => {
  const h = harness();
  assert.equal(h.wheel().prevented, true);
  h.advance(310); assert.ok(h.win.scrollY > 0 && h.win.scrollY < 800);
  assert.equal(h.wheel().prevented, true);
  h.advance(310); assert.equal(h.win.scrollY, 800);
  assert.equal(h.wheel().prevented, true);
  h.advance(181); assert.equal(h.wheel().prevented, undefined);
});

test('content scrolling stays native until an upward gesture crosses the opening boundary', () => {
  const h = harness(); h.win.scrollY = 1400;
  assert.equal(h.wheel({ deltaY: -100 }).prevented, undefined);
  h.win.scrollY = 850;
  assert.equal(h.wheel({ deltaY: -100 }).prevented, true);
  h.advance(620); assert.equal(h.win.scrollY, 0);
});

test('mobile offsets, enlarged hero content and reduced motion remain accessible', () => {
  const mobile = harness({ width: 390, height: 800, heroHeight: 676, reduced: true });
  mobile.wheel(); assert.equal(mobile.win.scrollY, 676);
  const enlarged = harness({ height: 600, heroHeight: 1000 });
  assert.equal(enlarged.wheel().prevented, undefined);
  enlarged.win.scrollY = 400; assert.equal(enlarged.wheel().prevented, true);
  enlarged.advance(620); assert.equal(enlarged.win.scrollY, 1000);
});

test('zoom gestures and nested scroll areas are untouched; keyboard transitions restore focus', () => {
  const h = harness();
  assert.equal(h.wheel({ ctrlKey: true }).prevented, undefined);
  assert.equal(h.wheel({ target: { closest: () => ({}) } }).prevented, undefined);
  assert.equal(h.wheel({ deltaX: 200 }).prevented, undefined);
  assert.equal(h.key({ key: 'PageDown' }).prevented, true);
  h.advance(620); assert.equal(h.chapters.focused, true);
  h.advance(200); h.key({ key: 'PageUp' }); h.advance(620);
  assert.equal(h.hero.focused, true);
  assert.equal(h.win.scrollY, 0);
});

test('resize settles the transition and page lifecycle events cancel stale frames', () => {
  const h = harness(); h.wheel(); h.advance(100);
  h.events.resize(); assert.equal(h.win.scrollY, 800); assert.equal(h.frames.size, 0);
  h.advance(200); h.wheel({ deltaY: -100 }); h.events.pagehide();
  assert.equal(h.frames.size, 0);
  h.events.pageshow(); h.wheel({ deltaY: -100 }); h.advance(620);
  assert.equal(h.win.scrollY, 0);
});
