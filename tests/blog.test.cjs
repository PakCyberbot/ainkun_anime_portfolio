const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeFeed, createFeedLoader, createVisitController, createVoicePlayer, shouldDelayNavigation, createPortraitSwitcher } = require('../blog.js');
const post = (title = 'Security notes', extra = {}) => ({ title, url: 'https://ainkun.medium.com/security-notes-123', publishedAt: '2023-09-06T00:10:29Z', ...extra });
const settle = () => new Promise(resolve => setImmediate(resolve));

test('portrait waits for decoding and ignores stale theme loads', async () => {
  const loads = new Map(), shown = [];
  const select = createPortraitSwitcher({
    load: theme => new Promise(resolve => loads.set(theme, resolve)),
    render: theme => shown.push(theme)
  });
  const evening = select('evening'), night = select('night');
  assert.deepEqual(shown, []);
  loads.get('night')(); assert.equal(await night, true);
  loads.get('evening')(); assert.equal(await evening, false);
  assert.deepEqual(shown, ['night']);
});

test('failed portrait load keeps the visible version and a later retry succeeds', async () => {
  let failed = true, current = 'morning';
  const select = createPortraitSwitcher({
    load: async () => { if (failed) throw new Error('Image unavailable'); },
    render: theme => { current = theme; }
  });
  assert.equal(await select('night'), false); assert.equal(current, 'morning');
  failed = false;
  assert.equal(await select('night'), true); assert.equal(current, 'night');
});

test('farewell delays only ordinary navigation to another portfolio page', () => {
  const current = 'https://example.github.io/portfolio/blog.html';
  const event = { button: 0 };
  const link = { href: 'index.html#about', target: '', hasAttribute: () => false };
  assert.equal(shouldDelayNavigation(event, link, current), true);
  for (const key of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey', 'defaultPrevented']) {
    assert.equal(shouldDelayNavigation({ ...event, [key]: true }, link, current), false);
  }
  assert.equal(shouldDelayNavigation({ button: 1 }, link, current), false);
  assert.equal(shouldDelayNavigation(event, { ...link, target: '_blank' }, current), false);
  assert.equal(shouldDelayNavigation(event, { ...link, hasAttribute: () => true }, current), false);
  assert.equal(shouldDelayNavigation(event, { ...link, href: '#writing' }, current), false);
  assert.equal(shouldDelayNavigation(event, { ...link, href: 'https://ainkun.medium.com/article' }, current), false);
});

test('feed filters unsafe links, deduplicates, sorts, and limits articles', () => {
  const data = normalizeFeed({ posts: [
    post('Old', { url: 'https://ainkun.medium.com/old', publishedAt: '2022-01-01' }),
    post('Bad', { url: 'javascript:alert(1)' }), post('Spoof', { url: 'https://medium.com.evil.test/post' }),
    post(), post('Duplicate'), post('Unsafe image', { url: 'https://medium.com/@ainkun/note', image: 'https://tracking.test/pixel' })
  ] }, 2);
  assert.equal(data.posts.length, 2);
  assert.equal(data.posts[0].title, 'Security notes');
  assert.equal(data.posts[1].image, '');
  assert.ok(data.posts.every(item => item.publishedAt.startsWith('2023')));
});

test('feed handles empty results and malformed payloads without fabricated articles', () => {
  assert.deepEqual(normalizeFeed({ posts: [] }).posts, []);
  assert.throws(() => normalizeFeed({ items: [] }));
  assert.throws(() => normalizeFeed({ posts: [{ title: 'Unsafe', url: 'data:text/html,hello' }] }));
  const data = normalizeFeed({ posts: [post('<img onerror=alert(1)>', { publishedAt: 'bad date' })] });
  assert.equal(data.posts[0].publishedAt, '');
  assert.equal(data.posts[0].title, '<img onerror=alert(1)>'); // Renderer assigns textContent, never HTML.
});

test('feed loader merges concurrent requests and expires the five-minute cache', async () => {
  let calls = 0, clock = 1;
  const load = createFeedLoader({ url: 'data/medium.json', now: () => clock, fetcher: async (url, options) => {
    calls++; assert.equal(url, 'data/medium.json'); assert.equal(options.cache, 'no-cache');
    return { ok: true, json: async () => ({ posts: [post()] }) };
  } });
  const first = load(); assert.equal(load(), first);
  await first; await load(); assert.equal(calls, 1);
  clock += 300001; await load(); assert.equal(calls, 2);
  await load(true); assert.equal(calls, 3);
});

test('failed feed requests can be retried successfully', async () => {
  let calls = 0;
  const load = createFeedLoader({ url: 'data/medium.json', fetcher: async () => ({ ok: ++calls > 1, json: async () => ({ posts: [post()] }) }) });
  await assert.rejects(load());
  assert.equal((await load()).posts.length, 1);
  assert.equal(calls, 2);
});

test('page visits greet once and returning after departure greets again', () => {
  const events = [];
  const visit = createVisitController({ enter: () => events.push('hello'), leave: () => events.push('bye') });
  visit.sync(false); visit.sync(true); visit.sync(true); visit.sync(false); visit.sync(false); visit.sync(true);
  assert.deepEqual(events, ['hello', 'bye', 'hello']);
  assert.equal(visit.active, true);
});

test('Medium clicks dismiss the host until an explicit return', () => {
  const events = [];
  const visit = createVisitController({ enter: () => events.push('hello'), leave: () => events.push('bye') });
  visit.sync(true); visit.depart(); visit.depart(); visit.sync(true);
  assert.deepEqual(events, ['hello', 'bye']);
  visit.sync(true, true); // Returning from the article or explicitly entering the blog.
  assert.deepEqual(events, ['hello', 'bye', 'hello']);
  visit.depart(); visit.sync(false); visit.sync(true);
  assert.equal(events.at(-1), 'hello');
});

test('blocked autoplay is recoverable and muting prevents playback', async () => {
  let plays = 0, blocked = true;
  const notices = [];
  const audio = { pause() {}, play() { plays++; return blocked ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve(); } };
  const voice = createVoicePlayer(audio, value => notices.push(value));
  voice.play('hello.mp3'); await settle(); assert.deepEqual(notices, [true]);
  blocked = false; voice.play('hello.mp3'); await settle(); assert.deepEqual(notices, [true, false]);
  voice.setEnabled(false); voice.play('bye.mp3'); assert.equal(plays, 2);
  voice.setEnabled(true); voice.play('bye.mp3'); assert.equal(plays, 3);
  assert.equal(audio.src, 'bye.mp3'); assert.equal(audio.volume, 0.55);
});

test('a cancelled hello cannot change audio controls after the farewell starts', async () => {
  let rejectHello;
  const notices = [];
  const audio = { pause() {}, play() { return this.src === 'hello.mp3' ? new Promise((_, reject) => { rejectHello = reject; }) : Promise.resolve(); } };
  const voice = createVoicePlayer(audio, value => notices.push(value));
  voice.play('hello.mp3'); voice.play('bye.mp3'); rejectHello(new Error('Aborted'));
  await settle(); assert.deepEqual(notices, [false]);
});
