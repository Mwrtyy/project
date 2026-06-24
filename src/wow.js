const intro = document.querySelector('#introLoader');
const cards = Array.from(document.querySelectorAll('.floating-card'));
const phoneWrap = document.querySelector('#phoneWrap');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

function removeIntro() {
  if (!intro) return;
  intro.classList.add('is-hidden');
  setTimeout(() => intro.remove(), 900);
}

window.addEventListener('load', () => {
  if (reduced) {
    removeIntro();
    return;
  }
  setTimeout(removeIntro, 1450);
});

window.addEventListener('pointermove', (event) => {
  targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetY = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function setupHyperInteractions() {
  const items = document.querySelectorAll('.interactive, .magnetic, .fx-button, .project-card, .service-card, .hero-metrics article, .tag-cloud span');

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

function setupRouteLikeSections() {
  const nav = document.querySelectorAll('.site-header .nav-link[data-target]');
  nav.forEach((button) => {
    button.addEventListener('click', () => {
      document.body.classList.add('route-flash');
      setTimeout(() => document.body.classList.remove('route-flash'), 520);
    });
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

    if (phoneWrap) {
      phoneWrap.style.transform = `translate3d(${(currentX * -8).toFixed(2)}px, ${(currentY * -6).toFixed(2)}px, 0)`;
    }
  }

  requestAnimationFrame(loop);
}

setupHyperInteractions();
setupRouteLikeSections();
loop();