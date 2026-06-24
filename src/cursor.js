import { lerp } from './utils.js';

export function initLiquidCursor(profile) {
  const cursor = document.querySelector('#liquidCursor');
  const trail = document.querySelector('#liquidCursorTrail');
  const root = document.documentElement;

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let x = targetX;
  let y = targetY;
  let trailX = targetX;
  let trailY = targetY;
  let rafId = 0;
  let running = false;

  function onPointerMove(event) {
    targetX = event.clientX;
    targetY = event.clientY;
  }

  function onInteractiveEnter() {
    document.body.classList.add('cursor-hovering');
  }

  function onInteractiveLeave() {
    document.body.classList.remove('cursor-hovering');
  }

  function onPhoneEnter() {
    document.body.classList.add('cursor-phone');
  }

  function onPhoneLeave() {
    document.body.classList.remove('cursor-phone');
  }

  function tick() {
    x = lerp(x, targetX, 0.18);
    y = lerp(y, targetY, 0.18);
    trailX = lerp(trailX, x, 0.09);
    trailY = lerp(trailY, y, 0.09);

    const dx = targetX - x;
    const dy = targetY - y;
    const speed = Math.min(Math.hypot(dx, dy) / 160, 1);
    const stretch = 1 + speed * 0.16;
    const squeeze = 1 - speed * 0.08;
    const angle = Math.atan2(dy, dx) * 57.2958;

    root.style.setProperty('--mx', `${x.toFixed(1)}px`);
    root.style.setProperty('--my', `${y.toFixed(1)}px`);

    cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) scale(${stretch.toFixed(3)}, ${squeeze.toFixed(3)}) scale(var(--cursor-scale))`;
    trail.style.transform = `translate3d(${trailX.toFixed(1)}px, ${trailY.toFixed(1)}px, 0) scale(${(0.86 + speed * 0.18).toFixed(3)})`;

    rafId = requestAnimationFrame(tick);
  }

  if (!cursor || !trail || !profile.cursor) {
    window.addEventListener('pointermove', (event) => {
      root.style.setProperty('--mx', `${event.clientX}px`);
      root.style.setProperty('--my', `${event.clientY}px`);
    }, { passive: true });
    return { destroy() {} };
  }

  document.body.classList.add('custom-cursor-ready');
  document.querySelectorAll('.interactive, button, a').forEach((element) => {
    element.addEventListener('pointerenter', onInteractiveEnter, { passive: true });
    element.addEventListener('pointerleave', onInteractiveLeave, { passive: true });
  });

  const stage = document.querySelector('.product-stage');
  if (stage) {
    stage.addEventListener('pointerenter', onPhoneEnter, { passive: true });
    stage.addEventListener('pointerleave', onPhoneLeave, { passive: true });
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  running = true;
  tick();

  return {
    destroy() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.body.classList.remove('custom-cursor-ready', 'cursor-hovering', 'cursor-phone');
    },
  };
}