import { detectPerformance } from './core/performance.js';
import { RafLoop } from './core/raf.js';
import { Router } from './core/router.js';
import { renderViews } from './components/renderViews.js';
import { LiquidCursor } from './effects/cursor.js';
import { ParticleField } from './effects/particles.js';
import { MagneticInteractions } from './effects/magnetic.js';
import { Reveal } from './effects/reveal.js';
import { animateCounters } from './effects/counters.js';
import { PhoneScene } from './three/phoneScene.js';

const profile = detectPerformance();
const loop = new RafLoop();

if (profile.lowPower) document.body.classList.add('performance-mode');

renderViews();

const reveal = new Reveal({ profile });
const magnetic = new MagneticInteractions({ profile });
const cursor = new LiquidCursor({ profile, loop });
const particles = new ParticleField({ profile, loop });
const phone = new PhoneScene({ profile, loop });

const router = new Router({
  onRouteChange: () => {
    reveal.refresh();
    magnetic.refresh();
  },
});

function hideLoader() {
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;
  loader.classList.add('is-hidden');
  window.setTimeout(() => loader.remove(), 900);
}

function init() {
  document.body.classList.remove('is-loading');

  reveal.init();
  magnetic.init();
  cursor.init();
  particles.init();
  phone.init();
  router.init();
  animateCounters({ profile });

  window.setTimeout(hideLoader, profile.reducedMotion ? 0 : 1450);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

window.addEventListener('pagehide', () => {
  cursor.destroy();
  particles.destroy();
  phone.destroy();
  reveal.destroy();
  router.destroy();
});
