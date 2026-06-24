export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

export function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectPerformanceProfile() {
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const touch = isTouchDevice();
  const smallScreen = window.innerWidth < 760;
  const reducedMotion = prefersReducedMotion();
  const lowPower = reducedMotion || memory <= 3 || cores <= 4 || smallScreen;

  return {
    lowPower,
    touch,
    reducedMotion,
    particleCount: lowPower ? 22 : 64,
    maxPixelRatio: lowPower ? 1.15 : Math.min(window.devicePixelRatio || 1, 1.75),
    antialias: !lowPower,
    shadows: !lowPower,
    cursor: !touch && !lowPower && !reducedMotion,
    screenTextureSize: lowPower ? 640 : 900,
  };
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function nextSection(order, active, direction = 1) {
  const index = order.indexOf(active);
  return order[(index + direction + order.length) % order.length];
}