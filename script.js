const profile = window.PORTFOLIO;
const make = (tag, className, text) => { const el = document.createElement(tag); el.className = className; if (text) el.textContent = text; return el; };
function configureLink(link, url, label) {
  if (url && /^https?:\/\//i.test(url)) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  else if (url && /^mailto:/i.test(url)) { link.href = url; }
  else { link.href = '#'; link.dataset.placeholder = label; link.setAttribute('aria-label', `${label} — link coming soon`); }
}
document.querySelector('#hero-description').textContent = profile.description;
document.querySelector('#about-copy').textContent = profile.about;
document.querySelector('#terminal-name').textContent = `${profile.name} // ainkun // cybersecurity analyst`;
profile.skills.forEach(skill => document.querySelector('#skills').append(make('span', 'skill', skill)));
profile.projects.forEach(project => {
  const card = make('article', 'project-card reveal');
  const top = make('div', 'card-top'); top.append(make('span', 'project-icon', project.icon), make('span', 'small-label', project.category));
  card.append(top, make('span', 'placeholder-badge', project.url ? 'PROJECT' : 'PROJECT PLACEHOLDER'), make('h3', '', project.title), make('p', '', project.description));
  const bottom = make('div', 'card-bottom'); const tags = make('div', 'tags'); project.tags.forEach(tag => tags.append(make('span', '', tag)));
  const link = make('a', 'project-arrow', '↗'); configureLink(link, project.url, project.title); bottom.append(tags, link); card.append(bottom); document.querySelector('#projects-grid').append(card);
});
profile.achievements.forEach((item, i) => {
  const row = make('div', 'achievement reveal'); const content = make('div', 'achievement-content'); content.append(make('span', 'small-label', item.type), make('h3', '', item.title), make('p', '', item.description));
  const link = make('a', 'achievement-year', `${item.year} ↗`); configureLink(link, item.url, item.title);
  row.append(make('span', 'achievement-number', `0${i + 1}`), content, link); document.querySelector('#achievement-list').append(row);
});
profile.writing.forEach(item => {
  const card = make('a', 'writing-card reveal'); configureLink(card, item.url, item.title); card.append(make('span', 'small-label', item.category), make('h3', '', item.title), make('p', '', item.description), make('span', 'text-link', item.url ? 'Read article ↗' : 'ARTICLE COMING SOON ↗')); document.querySelector('#writing-grid').append(card);
});
const labels = {github: 'GitHub', medium: 'Medium', linkedin: 'LinkedIn', x: 'X / Twitter', email: 'Email'};
Object.entries(labels).forEach(([key, label]) => { const link = make('a', 'social-link', `${label} ↗`); configureLink(link, key === 'email' && profile.socials.email ? `mailto:${profile.socials.email}` : profile.socials[key], label); document.querySelector('#socials').append(link); });
document.querySelectorAll('[data-social]').forEach(link => configureLink(link, profile.socials[link.dataset.social], 'Medium'));
if (!Object.values(profile.socials).some(Boolean)) document.querySelector('#contact-note').textContent = 'Social links will be added soon.';
document.querySelector('#year').textContent = new Date().getFullYear();
let toastTimer;
document.addEventListener('click', event => { const link = event.target.closest('[data-placeholder]'); if (!link) return; event.preventDefault(); const toast = document.querySelector('.toast'); toast.textContent = `${link.dataset.placeholder}: coming soon.`; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000); });
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), {threshold: 0.1}); document.querySelectorAll('.reveal').forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); }); }
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motion.matches) {
  const particles = document.querySelector('.particles'); for(let i = 0; i < 22; i++) { const dot = make('span', 'particle'); dot.style.left = `${(i * 47) % 100}%`; dot.style.top = `${(i * 31) % 100}%`; dot.style.animationDelay = `${-i * 0.7}s`; dot.style.animationDuration = `${7 + i % 6}s`; particles.append(dot); }
}
const profileStage = document.querySelector('.profile-stage');
const profilePanel = document.querySelector('.profile-panel');
function resetPortrait() {
  profilePanel.style.setProperty('--tilt-x', '0deg');
  profilePanel.style.setProperty('--tilt-y', '0deg');
}
profileStage.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || motion.matches || document.body.classList.contains('motion-paused') || document.body.classList.contains('card-popup-open')) return;
  const box = profileStage.getBoundingClientRect();
  profilePanel.style.setProperty('--tilt-x', `${(0.5 - (event.clientY - box.top) / box.height) * 6}deg`);
  profilePanel.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - 0.5) * 8}deg`);
});
profileStage.addEventListener('pointerleave', resetPortrait);
motion.addEventListener('change', resetPortrait);

// Give visitors control over decorative motion, while respecting OS preferences.
const motionButton = document.querySelector('.motion-toggle');
let userPausedMotion = false;
function updateMotion() {
  const paused = userPausedMotion || motion.matches;
  document.body.classList.toggle('motion-paused', paused);
  document.documentElement.dataset.motionPaused = String(paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.disabled = motion.matches;
  const label = motion.matches ? 'Animations paused by your reduced-motion preference' : paused ? 'Resume decorative animations' : 'Pause decorative animations';
  motionButton.setAttribute('aria-label', label);
  motionButton.title = label;
  motionButton.textContent = paused ? '▷' : 'Ⅱ';
  resetPortrait();
}
motionButton.addEventListener('click', () => { userPausedMotion = !userPausedMotion; updateMotion(); });
motion.addEventListener('change', updateMotion);
updateMotion();

// Highlight the chapter currently being read, including direct hash navigation.
const chapterLinks = [...document.querySelectorAll('.nav-item')];
const chapters = chapterLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollFramePending = false;
function updateChapter() {
  const threshold = window.innerWidth <= 760 ? 160 : 100;
  let active = 0;
  chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top <= threshold) active = index; });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) active = chapters.length - 1;
  chapterLinks.forEach((link, index) => {
    link.classList.toggle('active', index === active);
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollFramePending = false;
}
function queueChapterUpdate() {
  if (!scrollFramePending) { scrollFramePending = true; requestAnimationFrame(updateChapter); }
}
window.addEventListener('scroll', queueChapterUpdate, { passive: true });
window.addEventListener('resize', queueChapterUpdate);
window.addEventListener('load', queueChapterUpdate);
updateChapter();

// Move the shared letters instead of swapping two whole headings.
(() => {
  const button = document.querySelector('.name-switch');
  const prefix = button.querySelector('.name-prefix');
  const core = button.querySelector('.name-core');
  const k = button.querySelector('.name-k');
  const suffix = button.querySelector('.name-suffix');
  const dot = button.querySelector('.name-dot');
  let hovering = false;
  let keyboardFocus = false;
  let toggled = false;
  let nameAnimationTimer;
  const renderName = () => {
    const revealed = String(hovering || keyboardFocus || toggled);
    if (button.getAttribute('aria-pressed') === revealed) return;
    // Enable transitions only for interaction, never for initial font/layout fitting.
    clearTimeout(nameAnimationTimer);
    button.classList.add('name-animating');
    button.setAttribute('aria-pressed', revealed);
    nameAnimationTimer = setTimeout(() => button.classList.remove('name-animating'), 1600);
  };

  button.classList.add('name-ready');
  button.disabled = false;
  function fitName() {
    // offsetWidth measures the natural letters, unaffected by their animation.
    const [h, a, letterK, un, period] = [prefix, core, k, suffix, dot].map(part => part.offsetWidth);
    const gap = parseFloat(getComputedStyle(button).fontSize) * .16;
    const available = Math.max(1, button.clientWidth - 8); // Room for italic overhang.
    const closedScale = Math.min(1, available / (a + letterK + un + period));
    const openScale = Math.min(1, available / (h + a + gap + letterK + period));
    button.style.setProperty('--closed-scale', closedScale);
    button.style.setProperty('--open-scale', openScale);
    [
      [prefix, -h * .16, 0],
      [core, 0, h],
      [k, a, h + a + gap],
      [suffix, a + letterK, h + a + gap + letterK],
      [dot, a + letterK + un, h + a + gap + letterK]
    ].forEach(([part, from, to]) => {
      part.style.setProperty('--closed-x', `${from * closedScale}px`);
      part.style.setProperty('--open-x', `${to * openScale}px`);
    });
  }
  fitName();
  if ('ResizeObserver' in window) new ResizeObserver(fitName).observe(button);
  else window.addEventListener('resize', fitName);
  if (document.fonts) document.fonts.ready.then(fitName);

  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    renderName();
  });
  button.addEventListener('pointerleave', () => {
    hovering = false;
    renderName();
  });
  button.addEventListener('focus', () => {
    keyboardFocus = button.matches(':focus-visible');
    renderName();
  });
  button.addEventListener('blur', () => {
    keyboardFocus = false;
    toggled = false;
    renderName();
  });
  button.addEventListener('click', event => {
    // Mouse previews return on leave; tapping or keyboard activation toggles.
    if (hovering && event.detail !== 0) return;
    keyboardFocus = false;
    toggled = !toggled;
    renderName();
  });
})();
