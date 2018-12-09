import { mat3 } from "gl-matrix/lib/gl-matrix.js";
import "./style.css";
import {
  vertexShaderSource,
  fragmentShaderSource,
  flakeVertexShaderSource,
  flakeFragmentShaderSource,
  createShader,
  createProgram
} from "./webgl-utils.js";

class SnowFlake {
  constructor(gl, x, y, r, vx, vy) {
    this.gl = gl;
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
  }

  get transformMatrix() {
    const translation = [this.x, this.y];
    const rotation = this.randBetween(0, 2 * Math.PI);
    const scale = [this.r, this.r];
    const velocity = [this.vx, this.vy];

    let matrix = [];
    mat3.identity(matrix);
    mat3.projection(
      matrix,
      this.gl.canvas.clientWidth,
      this.gl.canvas.clientHeight
    );
    mat3.translate(matrix, matrix, translation);
    mat3.rotate(matrix, matrix, rotation);
    mat3.scale(matrix, matrix, scale);
    return matrix;
  }

  vertices() {
    let vertices = [];
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const vertice1 = [
        this.x + this.r * Math.cos(angle),
        this.y + this.r * Math.sin(angle)
      ];
      const vertice2 = [this.x, this.y];
      vertices = [...vertices, ...vertice1, ...vertice2];
    }
    return vertices;
  }

  randBetween(min, max) {
    return min + (max - min) * Math.random();
  }

  update(gl) {
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      flakeVertexShaderSource
    );
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      flakeFragmentShaderSource
    );
    const program = createProgram(gl, vertexShader, fragmentShader);

    const verticeAttribLocation = gl.getAttribLocation(program, "a_vertice");

    const vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    const verticeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
    // console.log('vertices', this.vertices());

    const vertices = this.vertices();

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices()),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(verticeBuffer);
    const [size, type, normalize, stride, offset] = [2, gl.FLOAT, false, 0, 0];
    gl.vertexAttribPointer(
      verticeAttribLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vertexArrayObject);
    const [mode, offset, count] = [gl.TRIANGLE_STRIP, 0, vertices.length];
    gl.drawArrays(mode, offset, count);
  }
}

class Snow {
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
    const flakes = window.innerWidth / 4;
    this.snowFlakes = [];
    for (let i = 0; i < flakes; i++) {
      const [x, y] = [
        this.randBetween(0, window.innerWidth),
        this.randBetween(0, -window.innerHeight)
      ];
      const r = this.randBetween(1, 4);
      const [vx, vy] = [this.randBetween(-3, 3), this.randBetween(2, 5)];
      this.snowFlakes.push(new SnowFlake(this.gl, x, y, r, vx, vy));
    }
  }

  update(gl) {
    // const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    // const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    // const program = createProgram(gl, vertexShader, fragmentShader);

    // const transformMatrixAttribLocation = gl.getAttribLocation(program, 'a_transformMatrix');

    // const vertexArrayObject = gl.createVertexArray();
    // gl.bindVertexArray(vertexArrayObject);

    // const transformMatrixBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, transformMatrixBuffer);

    // let transformMatrixData = [];
    // this.snowFlakes.forEach(snowFlake => {
    //   transformMatrixData = [
    //     ...transformMatrixData,
    //     ...snowFlake.transformMatrix
    //   ];
    // });
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transformMatrixData), gl.STATIC_DRAW);
    // gl.enableVertexAttribArray(transformMatrixBuffer);
    // const [size, type, normalize, stride, offset] = [9, gl.FLOAT, false, 0, 0];
    // gl.vertexAttribPointer(transformMatrixAttribLocation, size, type, normalize, stride, offset);

    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

    // gl.useProgram(program);
    // gl.bindVertexArray(vertexArrayObject);
    // const [mode, offset, count] = [gl.TRIANGLE_STRIP, 0, 9];
    // gl.drawArrays(mode, offset, count);

    // for (const flake of this.snowFlakes) {
    //   flake.update(this.gl);
    // }

    this.snowFlakes[0].update(this.gl);

    // requestAnimationFrame(this.update.bind(this, gl));
  }
}

new Snow();
