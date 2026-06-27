import { lerp } from '../core/maths.js';

export class LiquidCursor {
  constructor({ profile, loop }) {
    this.profile = profile; this.loop = loop;
    this.cursor = document.querySelector('[data-cursor]');
    this.trail = document.querySelector('[data-cursor-trail]');
    this.root = document.documentElement;
    this.target = { x: innerWidth / 2, y: innerHeight / 2 };
    this.current = { ...this.target }; this.trailPos = { ...this.target };
    this.onMove = this.onMove.bind(this); this.tick = this.tick.bind(this);
  }
  init() {
    addEventListener('pointermove', this.onMove, { passive: true });
    if (!this.profile.customCursor || !this.cursor || !this.trail) return;
    document.body.classList.add('custom-cursor-ready');
    document.addEventListener('pointerover', (e) => { if (e.target.closest('a,button,.js-magnetic')) document.body.classList.add('cursor-hovering'); if (e.target.closest('.showcase,.phone-fallback')) document.body.classList.add('cursor-phone'); }, { passive: true });
    document.addEventListener('pointerout', (e) => { if (e.target.closest('a,button,.js-magnetic')) document.body.classList.remove('cursor-hovering'); if (e.target.closest('.showcase,.phone-fallback')) document.body.classList.remove('cursor-phone'); }, { passive: true });
    this.unsubscribe = this.loop.add(this.tick);
  }
  onMove(e) { this.target.x = e.clientX; this.target.y = e.clientY; }
  tick() {
    this.current.x = lerp(this.current.x, this.target.x, .18); this.current.y = lerp(this.current.y, this.target.y, .18);
    this.trailPos.x = lerp(this.trailPos.x, this.current.x, .08); this.trailPos.y = lerp(this.trailPos.y, this.current.y, .08);
    this.root.style.setProperty('--mx', `${this.current.x.toFixed(1)}px`); this.root.style.setProperty('--my', `${this.current.y.toFixed(1)}px`);
    if (!this.profile.customCursor || !this.cursor || !this.trail) return;
    const dx = this.target.x - this.current.x, dy = this.target.y - this.current.y;
    const speed = Math.min(Math.hypot(dx, dy) / 170, 1), angle = Math.atan2(dy, dx) * 57.2958;
    this.cursor.style.transform = `translate3d(${this.current.x}px,${this.current.y}px,0) rotate(${angle}deg) scale(${1 + speed * .16},${1 - speed * .08}) scale(var(--cursor-scale))`;
    this.trail.style.transform = `translate3d(${this.trailPos.x}px,${this.trailPos.y}px,0)`;
  }
  destroy() { removeEventListener('pointermove', this.onMove); this.unsubscribe?.(); }
}
