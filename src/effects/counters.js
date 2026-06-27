export function animateCounters({ profile }) {
  document.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || '';
    if (profile.reducedMotion) { counter.textContent = `${target}${suffix}`; return; }
    const start = performance.now();
    const duration = 1100;
    function update(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}
