import { SECTION_ORDER } from './portfolioData.js';
import { detectPerformanceProfile } from './utils.js';
import { initLiquidCursor } from './cursor.js';
import { initIntroAnimations, initParticles } from './animations.js';
import { initScene } from './scene.js';

const profile = detectPerformanceProfile();
let activeSection = 'home';
let sceneApi = null;

const navButtons = [...document.querySelectorAll('[data-target]')];
const particleCanvas = document.querySelector('#particleCanvas');
const webglCanvas = document.querySelector('#webglScene');

if (profile.lowPower) {
  document.body.classList.add('performance-mode');
}

function setActiveSection(section) {
  if (!SECTION_ORDER.includes(section)) return;
  activeSection = section;

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === section);
  });

  if (sceneApi) sceneApi.setSection(section);
}

navButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveSection(button.dataset.target);
  });
});

const particles = initParticles(particleCanvas, profile);
const cursor = initLiquidCursor(profile);
initIntroAnimations(profile);

sceneApi = await initScene({
  canvas: webglCanvas,
  profile,
  getActiveSection: () => activeSection,
  onSectionRequest: setActiveSection,
});
sceneApi.setSection(activeSection);

window.addEventListener('pagehide', () => {
  particles.destroy();
  cursor.destroy();
  sceneApi?.destroy();
});