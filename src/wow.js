const intro = document.querySelector('#introLoader');
const cards = Array.from(document.querySelectorAll('.floating-card'));
const phoneWrap = document.querySelector('#phoneWrap');
const shell = document.querySelector('.page-shell');
const hero = document.querySelector('.hero-section');
const showreel = document.querySelector('.showreel-section');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

loadCss('styles/pages.css');
loadCss('styles/button-effects.css');

function removeIntro() {
  if (!intro) return;
  intro.classList.add('is-hidden');
  setTimeout(() => intro.remove(), 900);
}

window.addEventListener('load', () => {
  setTimeout(removeIntro, reduced ? 0 : 1450);
});

const routeData = {
  edits: ['EDITS', 'Cinematic cuts, beat sync visuals, transition edits, music cuts and social ads.', ['Cinematic Edit', 'Beat Sync', 'Transition Edit', 'Aesthetic Edit', 'Music Video Cut', 'Social Media Ad']],
  skills: ['SKILLS', 'Editing, rhythm, grading, sound design and motion polish for short-form content.', ['Video Editing 96%', 'Beat Sync 94%', 'Transitions 92%', 'Color Grading 88%', 'Sound Design 84%', 'Motion Design 80%']],
  contact: ['CONTACT', 'For creators, brands and artists who need visuals that hit fast.', ['TikTok @shahine.edits', 'Instagram @shahine.visuals', 'Email shahine.edits@example.com']]
};

function buildRoutes() {
  if (!shell || document.querySelector('#routePages')) return;
  const wrap = document.createElement('section');
  wrap.id = 'routePages';
  wrap.className = 'route-pages';

  Object.entries(routeData).forEach(([key, data]) => {
    const view = document.createElement('article');
    view.className = 'route-view';
    view.dataset.route = key;
    view.innerHTML = '<section class="page-hero"><div class="page-hero-grid"><div><p class="eyebrow">SHAHINE / ' + key + '</p><h1 class="page-title">' + data[0] + '</h1><p class="page-copy">' + data[1] + '</p></div><div class="page-orbit"><div class="orbit-core"><strong>' + (key === 'edits' ? '06' : key === 'skills' ? '96' : '24H') + '</strong><span>' + key + '</span></div></div></div></section>';
    const wall = document.createElement('section');
    wall.className = key === 'skills' ? 'skills-lab' : key === 'contact' ? 'contact-lab' : 'edit-wall';
    const grid = document.createElement('div');
    grid.className = key === 'edits' ? 'edit-grid' : key === 'skills' ? 'process-rail' : 'contact-actions';
    data[2].forEach((label, index) => {
      const item = document.createElement(key === 'contact' ? 'a' : 'article');
      item.className = key === 'edits' ? 'edit-card interactive' : key === 'skills' ? 'process-step interactive' : 'contact-action interactive';
      if (key === 'contact') item.href = '#';
      item.innerHTML = key === 'edits'
        ? '<div class="edit-meta"><span>0' + (index + 1) + '</span><span>premium</span></div><h2>' + label + '</h2><p>Polished short-form visuals with rhythm, retention and clean finishing.</p>'
        : key === 'skills'
          ? '<h3>' + label + '</h3><p>Precise workflow, clean structure and premium motion decisions.</p>'
          : '<strong>' + label.split(' ')[0] + '</strong><span>' + label.replace(label.split(' ')[0], '') + '</span>';
      grid.appendChild(item);
    });
    wall.appendChild(grid);
    view.appendChild(wall);
    wrap.appendChild(view);
  });
  shell.appendChild(wrap);
}

function setRoute(route) {
  const home = route === 'home';
  if (hero) hero.hidden = !home;
  if (showreel) showreel.hidden = !home;
  document.querySelectorAll('.route-view').forEach((view) => view.classList.toggle('active', view.dataset.route === route));
  document.querySelectorAll('[data-target]').forEach((button) => button.classList.toggle('active', button.dataset.target === route));
  document.body.classList.add('route-flash');
  setTimeout(() => document.body.classList.remove('route-flash'), 520);
}

function setupRoutes() {
  buildRoutes();
  document.querySelectorAll('.site-header [data-target], .hero-actions [data-target]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.target));
  });
}

window.addEventListener('pointermove', (event) => {
  targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetY = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function setupHyperInteractions() {
  const items = document.querySelectorAll('.interactive, .project-card, .service-card, .edit-card, .process-step, .contact-action, .hero-metrics article, .tag-cloud span');
  items.forEach((item) => {
    item.classList.add('hyper-ready');
    item.addEventListener('pointermove', (event) => {
      if (!precisePointer || reduced) return;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      item.style.setProperty('--hover-x', `${x}px`);
      item.style.setProperty('--hover-y', `${y}px`);
      item.style.setProperty('--mag-x', `${(nx * 12).toFixed(2)}px`);
      item.style.setProperty('--mag-y', `${(ny * 12).toFixed(2)}px`);
      item.style.setProperty('--tilt-x', `${(-ny * 6).toFixed(2)}deg`);
      item.style.setProperty('--tilt-y', `${(nx * 6).toFixed(2)}deg`);
    }, { passive: true });
    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--mag-x', '0px');
      item.style.setProperty('--mag-y', '0px');
      item.style.setProperty('--tilt-x', '0deg');
      item.style.setProperty('--tilt-y', '0deg');
    }, { passive: true });
  });
}

function loop() {
  currentX += (targetX - currentX) * 0.075;
  currentY += (targetY - currentY) * 0.075;
  if (precisePointer && !reduced) {
    cards.forEach((card, index) => {
      const depth = Number(card.getAttribute('data-depth') || 10);
      const x = currentX * depth;
      const y = currentY * depth * 0.65;
      const rotate = currentX * (index % 2 ? -3 : 3);
      card.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`;
    });
    if (phoneWrap) phoneWrap.style.transform = `translate3d(${(currentX * -8).toFixed(2)}px, ${(currentY * -6).toFixed(2)}px, 0)`;
  }
  requestAnimationFrame(loop);
}

setupRoutes();
setupHyperInteractions();
loop();