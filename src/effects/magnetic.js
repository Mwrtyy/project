export class MagneticInteractions {
  constructor({ profile }) { this.profile = profile; this.elements = []; this.move = this.move.bind(this); this.leave = this.leave.bind(this); this.down = this.down.bind(this); }
  init() { this.refresh(); }
  refresh() {
    this.destroy();
    this.elements = Array.from(document.querySelectorAll('.js-magnetic,.js-ripple,.tag,.metric-card,.edit-card,.skill-card,.contact-card,.tool-chip'));
    this.elements.forEach((el) => { el.addEventListener('pointermove', this.move, { passive: true }); el.addEventListener('pointerleave', this.leave, { passive: true }); el.addEventListener('pointerdown', this.down); });
  }
  move(e) {
    if (this.profile.reducedMotion || this.profile.coarsePointer) return;
    const el = e.currentTarget, r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, nx = x / r.width - .5, ny = y / r.height - .5;
    el.style.setProperty('--hover-x', `${x}px`); el.style.setProperty('--hover-y', `${y}px`);
    el.style.setProperty('--mag-x', `${(nx * 12).toFixed(2)}px`); el.style.setProperty('--mag-y', `${(ny * 12).toFixed(2)}px`);
    el.style.setProperty('--tilt-x', `${(-ny * 6).toFixed(2)}deg`); el.style.setProperty('--tilt-y', `${(nx * 6).toFixed(2)}deg`);
  }
  leave(e) { ['--mag-x','--mag-y'].forEach(p => e.currentTarget.style.setProperty(p,'0px')); ['--tilt-x','--tilt-y'].forEach(p => e.currentTarget.style.setProperty(p,'0deg')); }
  down(e) {
    const el = e.currentTarget; if (!el.classList.contains('js-ripple')) return;
    const r = el.getBoundingClientRect(), ripple = document.createElement('span'); ripple.className = 'ripple';
    ripple.style.setProperty('--ripple-x', `${e.clientX - r.left}px`); ripple.style.setProperty('--ripple-y', `${e.clientY - r.top}px`);
    el.appendChild(ripple); ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }
  destroy() { this.elements.forEach((el) => { el.removeEventListener('pointermove', this.move); el.removeEventListener('pointerleave', this.leave); el.removeEventListener('pointerdown', this.down); }); }
}
