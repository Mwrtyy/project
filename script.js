/*
  Interactions du portfolio Shahine.
  - Navigation entre les sections dans l'iPhone
  - Rotation 3D au mouvement de souris
  - Spotlight + particules légères
  - Swipe mobile dans l'écran du téléphone
*/

const sections = ['home', 'edits', 'skills', 'contact'];
let activeSection = 'home';

const root = document.documentElement;
const phoneShell = document.querySelector('#phoneShell');
const phoneScreen = document.querySelector('#phoneScreen');
const panels = [...document.querySelectorAll('.phone-panel')];
const navButtons = [...document.querySelectorAll('[data-target]')];
const skillRows = [...document.querySelectorAll('.skill-row')];
const canvas = document.querySelector('#particleCanvas');
const ctx = canvas.getContext('2d');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setActiveSection(nextSection) {
  if (!sections.includes(nextSection)) return;

  activeSection = nextSection;

  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.section === nextSection);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === nextSection);
  });

  // Les barres restent à 0 jusqu'à l'ouverture de la section Skills.
  if (nextSection === 'skills') {
    skillRows.forEach((row, index) => {
      const progress = row.dataset.progress || 0;
      row.style.setProperty('--progress', '0%');
      window.setTimeout(() => row.style.setProperty('--progress', `${progress}%`), 80 + index * 70);
    });
  } else {
    skillRows.forEach((row) => row.style.setProperty('--progress', '0%'));
  }
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveSection(button.dataset.target));
});

// Rotation 3D du téléphone + spotlight qui suit le curseur.
window.addEventListener('pointermove', (event) => {
  const x = event.clientX;
  const y = event.clientY;

  root.style.setProperty('--mx', `${x}px`);
  root.style.setProperty('--my', `${y}px`);

  if (!phoneShell || prefersReducedMotion) return;

  const rect = phoneShell.getBoundingClientRect();
  const phoneCenterX = rect.left + rect.width / 2;
  const phoneCenterY = rect.top + rect.height / 2;
  const deltaX = (x - phoneCenterX) / rect.width;
  const deltaY = (y - phoneCenterY) / rect.height;

  const rotateY = clamp(deltaX * 20, -16, 16);
  const rotateX = clamp(deltaY * -18, -14, 14);

  root.style.setProperty('--phone-rotate-x', `${rotateX.toFixed(2)}deg`);
  root.style.setProperty('--phone-rotate-y', `${rotateY.toFixed(2)}deg`);
});

window.addEventListener('pointerleave', () => {
  root.style.setProperty('--phone-rotate-x', '0deg');
  root.style.setProperty('--phone-rotate-y', '0deg');
});

// Swipe horizontal dans l'écran du téléphone.
let touchStartX = 0;
let touchStartY = 0;

phoneScreen.addEventListener('pointerdown', (event) => {
  touchStartX = event.clientX;
  touchStartY = event.clientY;
});

phoneScreen.addEventListener('pointerup', (event) => {
  const dx = event.clientX - touchStartX;
  const dy = event.clientY - touchStartY;

  if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;

  const currentIndex = sections.indexOf(activeSection);
  const direction = dx < 0 ? 1 : -1;
  const nextIndex = (currentIndex + direction + sections.length) % sections.length;
  setActiveSection(sections[nextIndex]);
});

// Micro-interactions : légère inclinaison des cartes projet dans l'écran.
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (prefersReducedMotion) return;

    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = `translateY(-3px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Particules discrètes type poussière lumineuse / grain audiovisuel.
const particles = [];
let width = 0;
let height = 0;
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  buildParticles();
}

function buildParticles() {
  particles.length = 0;
  const count = Math.round(clamp(width / 18, 42, 96));

  for (let index = 0; index < count; index += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.25,
      alpha: Math.random() * 0.42 + 0.1,
      speedX: (Math.random() - 0.5) * 0.16,
      speedY: Math.random() * 0.12 + 0.03,
      pulse: Math.random() * Math.PI * 2,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.pulse += 0.018;

    if (particle.y > height + 10) particle.y = -10;
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;

    const glow = particle.alpha + Math.sin(particle.pulse) * 0.08;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(238, 239, 241, ${glow})`;
    ctx.fill();
  });

  if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawParticles();
setActiveSection('home');