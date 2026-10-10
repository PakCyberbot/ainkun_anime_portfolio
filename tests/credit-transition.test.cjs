const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({ reduced = false, paused = false } = {}) {
  const listeners = {}, windowListeners = {}, timers = new Map(), destinations = [];
  let nextTimer = 0;
  const node = () => ({ children: [], attributes: {}, style: { setProperty(k, v) { this[k] = v; } },
    append(...children) { children.forEach(child => { child.parent = this; this.children.push(child); }); },
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); },
    setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; },
    hasAttribute(k) { return k in this.attributes; }, focus() { this.focused = true; }
  });
  const link = node(), body = node();
  link.href = 'https://pakcyberbot.com';
  link.closest = () => link;
  const preference = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../credit-transition.js'), 'utf8'), {
    document: { body, documentElement: { dataset: { motionPaused: String(paused) } },
      querySelector: () => link, createElement: node,
      addEventListener: (type, fn) => { listeners[type] = fn; }
    },
    window: { innerWidth: 1440, matchMedia: () => preference,
      location: { assign: href => destinations.push(href) },
      addEventListener: (type, fn) => { windowListeners[type] = fn; }
    },
    setTimeout: (fn, delay) => { timers.set(++nextTimer, { fn, delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  });
  return { body, link, timers, destinations, preference, windowListeners,
    click(options = {}) {
      const event = { target: link, button: 0, preventDefault() { this.defaultPrevented = true; }, ...options };
      listeners.click(event); return event;
    },
    escape: () => listeners.keydown({ key: 'Escape', preventDefault() {} }),
    fire() { const [id, timer] = timers.entries().next().value; timers.delete(id); timer.fn(); }
  };
}

test('ordinary activation creates Japanese rain and navigates once after the send-off', () => {
  const h = harness();
  assert.equal(h.click().defaultPrevented, true);
  assert.equal(h.body.children.length, 1);
  const rain = h.body.children[0].children[0];
  assert.equal(rain.attributes['aria-hidden'], 'true');
  assert.ok(rain.children.length <= 64);
  assert.match(rain.children[0].textContent, /^[\u30a0-\u30ff探索接続\n]+$/u);
  const logo = h.body.children[0].children[1].children[0].children[0];
  assert.equal(logo.src, 'pakcyberbot.png');
  assert.equal([...h.timers.values()][0].delay, 2400);
  h.click(); assert.equal(h.timers.size, 1);
  assert.deepEqual(h.destinations, []);
  h.fire(); assert.deepEqual(h.destinations, ['https://pakcyberbot.com']);
  assert.equal(h.body.children.length, 1); // Veil stays up while the destination loads.
  h.windowListeners.pagehide();
  assert.equal(h.body.children.length, 0);
  assert.equal(h.timers.size, 0);
});

test('modified clicks, reduced motion and other native actions are never intercepted', () => {
  for (const options of [{ ctrlKey:true }, { metaKey:true }, { shiftKey:true }, { altKey:true }, { button:1 }]) {
    const h = harness(); assert.equal(h.click(options).defaultPrevented, undefined);
    assert.equal(h.timers.size, 0);
  }
  for (const options of [{ reduced:true }, { paused:true }]) {
    const h = harness(options); assert.equal(h.click().defaultPrevented, undefined);
    assert.equal(h.body.children.length, 0);
  }
});

test('Escape cancels navigation, restores focus and allows another attempt', () => {
  const h = harness(); h.click(); h.escape();
  assert.equal(h.timers.size, 0);
  assert.equal(h.body.children.length, 0);
  assert.equal(h.link.focused, true);
  assert.deepEqual(h.destinations, []);
  h.click(); assert.equal(h.timers.size, 1);
  h.windowListeners.pageshow();
  assert.equal(h.body.children.length, 0);
  assert.equal(h.link.attributes['aria-busy'], undefined);
});

test('navigation cancellation recovery and live reduced-motion changes clean up the overlay', () => {
  const h = harness(); h.click(); h.fire(); h.fire();
  assert.equal(h.body.children.length, 0);
  h.click(); h.preference.matches = true; h.preference.change();
  assert.equal(h.body.children.length, 0);
  assert.equal(h.timers.size, 0);
  assert.deepEqual(h.destinations, ['https://pakcyberbot.com', 'https://pakcyberbot.com']);
});
