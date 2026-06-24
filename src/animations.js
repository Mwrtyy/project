import { clamp } from './utils.js';

export function initIntroAnimations(profile) {
  const revealItems = document.querySelectorAll('.reveal');

  if (profile.reducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    document.body.classList.remove('is-loading');
    return;
  }

  requestAnimationFrame(() => {
    document.body.classList.remove('is-loading');
    revealItems.forEach((item, index) => {
      window.setTimeout(() => item.classList.add('is-visible'), index * 80);
    });
  });
}

export function initParticles(canvas, profile) {
  if (!canvas || profile.reducedMotion) return { destroy() {} };

  const ctx = canvas.getContext('2d', { alpha: true });
  const particles = [];
  const dpr = Math.min(window.devicePixelRatio || 1, profile.lowPower ? 1 : 1.35);
  let width = 0;
  let height = 0;
  let rafId = 0;
  let active = true;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    particles.length = 0;
    const count = clamp(profile.particleCount, 12, 72);
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.55 + 0.22,
        alpha: Math.random() * 0.32 + 0.08,
        speedX: (Math.random() - 0.5) * 0.11,
        speedY: Math.random() * 0.095 + 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.phase += 0.015;

      if (particle.y > height + 8) particle.y = -8;
      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;

      const alpha = particle.alpha + Math.sin(particle.phase) * 0.06;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(238,239,241,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });

  return {
    destroy() {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    },
  };
}