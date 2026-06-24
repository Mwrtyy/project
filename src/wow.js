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

loop();