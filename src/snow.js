import { SnowFlake } from "./components/snow-flake.js";

export class Snow {
  constructor() {
    this.canvas = document.createElement("canvas");
    document.querySelector("body").appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl2");

    this.addListeners();
    this.createSnowFlakes();
    requestAnimationFrame(this.update.bind(this, this.gl));
  }

  addListeners() {
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  randBetween(min, max) {
    return min + (max - min) * Math.random();
  }

  createSnowFlakes() {
    const flakes = window.innerWidth / 256;
    console.log({ flakes });
    this.snowFlakes = [];
    for (let i = 0; i < flakes; i++) {
      const [x, y] = [
        this.randBetween(0, window.innerWidth),
        this.randBetween(0, window.innerHeight / 2)
      ];
      const r = this.randBetween(1, 4);
      const [vx, vy] = [this.randBetween(-3, 3), this.randBetween(2, 5)];
      this.snowFlakes.push(new SnowFlake(this.gl, x, y, r, vx, vy));
    }

    this.snowFlakes.forEach(flake => flake.draw(this.gl));
  }

  update(gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

    for (const flake of this.snowFlakes) {
      flake.update(this.gl);
    }

    // this.snowFlakes[0].update(this.gl);

    requestAnimationFrame(this.update.bind(this, gl));
  }
}
