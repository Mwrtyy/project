export function detectPerformance() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const smallViewport = window.innerWidth < 760;
  const lowPower = reducedMotion || coarsePointer || smallViewport || memory <= 3 || cores <= 4;

  return {
    reducedMotion,
    coarsePointer,
    lowPower,
    customCursor: !reducedMotion && !coarsePointer && !smallViewport,
    particleCount: lowPower ? 24 : 76,
    particleDpr: Math.min(window.devicePixelRatio || 1, lowPower ? 1.1 : 1.45),
    webglPixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    webgl: supportsWebGL(),
  };
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}
