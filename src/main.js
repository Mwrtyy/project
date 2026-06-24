const SECTIONS = ['home', 'edits', 'skills', 'contact'];
let activeSection = 'home';

const root = document.documentElement;
const navButtons = [...document.querySelectorAll('[data-target]')];
const panels = [...document.querySelectorAll('.screen-panel')];
const phoneScreen = document.querySelector('#phoneScreen');
const phoneWrap = document.querySelector('#phoneWrap');
const phoneDevice = document.querySelector('#phoneDevice');
const skillRows = [...document.querySelectorAll('.skill-row')];
const particleCanvas = document.querySelector('#particleCanvas');
const cursor = document.querySelector('#liquidCursor');
const cursorTrail = document.querySelector('#liquidCursorTrail');

const profile = detectProfile();
const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  smoothX: window.innerWidth / 2,
  smoothY: window.innerHeight / 2,
  trailX: window.innerWidth / 2,
  trailY: window.innerHeight / 2,
  phoneRX: 0,
  phoneRY: -13,
  targetPhoneRX: 0,
  targetPhoneRY: -13,
};

if (profile.lowPower) document.body.classList.add('performance-mode');
if (profile.customCursor) document.body.classList.add('custom-cursor-ready');

function detectProfile() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const small = window.innerWidth < 760;
  const lowPower = reducedMotion || touch || small || memory <= 3 || cores <= 4;

  return {
    reducedMotion,
    touch,
    lowPower,
    customCursor: !touch && !reducedMotion && !small,
    particles: lowPower ? 24 : 72,
    dpr: Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.55),
  };
}

function setActiveSection(section) {
  if (!SECTIONS.includes(section)) return;
  activeSection = section;

  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.section === section);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === section);
  });

  if (section === 'skills') {
    skillRows.forEach((row, index) => {
      row.style.setProperty('--progress', '0%');
      window.setTimeout(() => {
        row.style.setProperty('--progress', `${row.dataset.progress || 0}%`);
      }, 80 + index * 70);
    });
  } else {
    skillRows.forEach((row) => row.style.setProperty('--progress', '0%'));
  }
}

function nextSection(direction) {
  const index = SECTIONS.indexOf(activeSection);
  const next = (index + direction + SECTIONS.length) % SECTIONS.length;
  setActiveSection(SECTIONS[next]);
}

navButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveSection(button.dataset.target);
  });
});

let startX = 0;
let startY = 0;

if (phoneScreen) {
  phoneScreen.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
  }, { passive: true });

  phoneScreen.addEventListener('pointerup', (event) => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) {
      nextSection(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

document.querySelectorAll('.interactive, button, a').forEach((element) => {
  element.addEventListener('pointerenter', () => document.body.classList.add('cursor-hovering'), { passive: true });
  element.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hovering'), { passive: true });
});

if (phoneWrap) {
  phoneWrap.addEventListener('pointerenter', () => document.body.classList.add('cursor-phone'), { passive: true });
  phoneWrap.addEventListener('pointerleave', () => document.body.classList.remove('cursor-phone'), { passive: true });
}

window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;

  const nx = (event.clientX / window.innerWidth - 0.5) * 2;
  const ny = (event.clientY / window.innerHeight - 0.5) * 2;

  if (!profile.reducedMotion) {
    pointer.targetPhoneRY = -13 + clamp(nx * 13, -12, 12);
    pointer.targetPhoneRX = clamp(-ny * 9, -8, 8);
  }
}, { passive: true });

function animatePointer() {
  pointer.smoothX = lerp(pointer.smoothX, pointer.x, 0.18);
  pointer.smoothY = lerp(pointer.smoothY, pointer.y, 0.18);
  pointer.trailX = lerp(pointer.trailX, pointer.smoothX, 0.08);
  pointer.trailY = lerp(pointer.trailY, pointer.smoothY, 0.08);
  pointer.phoneRX = lerp(pointer.phoneRX, pointer.targetPhoneRX, 0.075);
  pointer.phoneRY = lerp(pointer.phoneRY, pointer.targetPhoneRY, 0.075);

  root.style.setProperty('--mx', `${pointer.smoothX.toFixed(1)}px`);
  root.style.setProperty('--my', `${pointer.smoothY.toFixed(1)}px`);
  root.style.setProperty('--phone-rx', `${pointer.phoneRX.toFixed(2)}deg`);
  root.style.setProperty('--phone-ry', `${pointer.phoneRY.toFixed(2)}deg`);

  if (profile.customCursor && cursor && cursorTrail) {
    const dx = pointer.x - pointer.smoothX;
    const dy = pointer.y - pointer.smoothY;
    const speed = Math.min(Math.hypot(dx, dy) / 170, 1);
    const angle = Math.atan2(dy, dx) * 57.2958;
    const stretch = 1 + speed * 0.16;
    const squeeze = 1 - speed * 0.08;

    cursor.style.transform = `translate3d(${pointer.smoothX.toFixed(1)}px, ${pointer.smoothY.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) scale(${stretch.toFixed(3)}, ${squeeze.toFixed(3)}) scale(var(--cursor-scale))`;
    cursorTrail.style.transform = `translate3d(${pointer.trailX.toFixed(1)}px, ${pointer.trailY.toFixed(1)}px, 0) scale(${(0.86 + speed * 0.18).toFixed(3)})`;
  }

  requestAnimationFrame(animatePointer);
}

function initParticles() {
  if (!particleCanvas || profile.reducedMotion) return;

  const ctx = particleCanvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  const particles = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.floor(width * profile.dpr);
    particleCanvas.height = Math.floor(height * profile.dpr);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    ctx.setTransform(profile.dpr, 0, 0, profile.dpr, 0, 0);
    build();
  }

  function build() {
    particles.length = 0;
    for (let index = 0; index < profile.particles; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.45 + 0.22,
        a: Math.random() * 0.28 + 0.08,
        vx: (Math.random() - 0.5) * 0.11,
        vy: Math.random() * 0.085 + 0.018,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.phase += 0.014;

      if (particle.y > height + 10) particle.y = -10;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;

      const alpha = particle.a + Math.sin(particle.phase) * 0.055;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(238,239,241,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
}

function initReveal() {
  const items = [...document.querySelectorAll('.reveal')];

  if (profile.reducedMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    document.body.classList.remove('is-loading');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  items.forEach((item) => observer.observe(item));
  window.setTimeout(() => document.body.classList.remove('is-loading'), 120);
}

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

initReveal();
initParticles();
setActiveSection('home');
animatePointer();