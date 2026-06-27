export class Reveal {
  constructor({ profile }) { this.profile = profile; this.observer = null; }
  init() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (this.profile.reducedMotion) { items.forEach((item) => item.classList.add('is-visible')); return; }
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); this.observer.unobserve(entry.target); } });
    }, { threshold: 0.16 });
    items.forEach((item) => this.observer.observe(item));
  }
  refresh() { this.destroy(); this.init(); }
  destroy() { this.observer?.disconnect(); }
}
