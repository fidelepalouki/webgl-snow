import { mat3 } from "gl-matrix/lib/gl-matrix.js";
// import "./style.css";
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

    this.vertices = this.getVertices();
  }

  get translation() {
    return [this.x, this.y];
  }

  get rotation() {
    return [this.randBetween(0, 2 * Math.PI)];
  }

  get scaling() {
    return [this.r, this.r];
  }

  get velocity() {
    return [this.vx, this.vy];
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

  get projectionMatrix() {
    let matrix = [];
    mat3.identity(matrix);
    mat3.projection(
      matrix,
      this.gl.canvas.clientWidth,
      this.gl.canvas.clientHeight
    );
    return matrix;
  }

  getVertices() {
    let vertices = [];
    for (let i = 0; i <= 360; i += 36) {
      const angle = (i / 180) * Math.PI;
      const vertice1 = [Math.cos(angle), Math.sin(angle)];
      const vertice2 = [0, 0];
      vertices = [...vertices, ...vertice1, ...vertice2];
    }
    return vertices;
  }

  randBetween(min, max) {
    return min + (max - min) * Math.random();
  }

  draw(gl) {
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
    // const transformMatrixUniformLocation = gl.getUniformLocation(program, 'u_transformMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(
      program,
      "u_projectionMatrix"
    );
    const translationUniformLocation = gl.getUniformLocation(
      program,
      "u_translation"
    );
    const rotationUniformLocation = gl.getUniformLocation(
      program,
      "u_rotation"
    );
    const scalingUniformLocation = gl.getUniformLocation(program, "u_scaling");
    const velocityUniformLocation = gl.getUniformLocation(
      program,
      "u_velocity"
    );

    const vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    const verticeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
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
    // gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vertexArrayObject);

    // gl.uniformMaMatrixtrix3fv(transformMatrixUniformLocation, false, this.transformMatrix);
    gl.uniformMatrix3fv(
      projectionMatrixUniformLocation,
      false,
      this.projectionMatrix
    );
    gl.uniform2fv(translationUniformLocation, this.translation);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform2fv(scalingUniformLocation, this.scaling);
    gl.uniform2fv(velocityUniformLocation, this.velocity);

    const [mode, offset2, count] = [
      gl.TRIANGLE_STRIP,
      0,
      this.vertices.length / size
    ];
    gl.drawArrays(mode, offset2, count);
  }

  update(gl) {
    this.x += this.vx;
    this.y += this.vy;
    this.draw(gl);
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

    requestAnimationFrame(this.update.bind(this, gl));
  }
}

new Snow();
