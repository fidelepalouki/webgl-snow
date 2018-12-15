export class SnowFlake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = this.randBetween(0, window.innerWidth);
    this.y = this.randBetween(0, -window.innerHeight);
    this.vx = this.randBetween(-3, 3);
    this.vy = this.randBetween(2, 5);
    this.radius = this.randBetween(1, 4);
    this.alpha = this.randBetween(0.1, 0.9);
  }

  randBetween(min, max) {
    return min + (max - min) * Math.random();
  }

  get props() {
    return [this.x, this.y, this.radius, this.alpha];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (
      this.x + this.radius > window.innerWidth ||
      this.y + this.radius > window.innerHeight
    ) {
      this.reset();
    }
  }
}
