export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(current, target, factor) {
  return current + (target - current) * factor;
}
