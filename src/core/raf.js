export class RafLoop {
  constructor() {
    this.callbacks = new Set();
    this.running = false;
    this.lastTime = 0;
    this.tick = this.tick.bind(this);
  }

  add(callback) {
    this.callbacks.add(callback);
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.tick);
    }
    return () => this.remove(callback);
  }

  remove(callback) {
    this.callbacks.delete(callback);
    if (this.callbacks.size === 0) this.running = false;
  }

  tick(time) {
    if (!this.running) return;
    const delta = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.callbacks.forEach((callback) => callback(delta, time));
    requestAnimationFrame(this.tick);
  }
}
