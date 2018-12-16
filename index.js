let recording = false;
const capturer = new CCapture({
  format: "gif",
  framerate: 60,
  verbose: true,
  workersPath: "gif/"
});

const vertexShaderSource = `
  attribute vec4 a_snowFlakeProps;
  uniform mat3 u_projectionMatrix;
  varying vec4 v_color;

  void main() {
    gl_Position = vec4((u_projectionMatrix * vec3(a_snowFlakeProps.xy, 1)).xy, 0, 1);
    gl_PointSize = 2.0 * a_snowFlakeProps.z;
    v_color = vec4(1, 1, 1, a_snowFlakeProps.w);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    vec2 distToCenter = gl_PointCoord - vec2(0.5, 0.5);
    float distToCenterSquared = dot(distToCenter, distToCenter);
    float alpha;

    if (distToCenterSquared < 0.25) {
      alpha = v_color.w;
    } else {
      alpha = 0.0;
    }

    gl_FragColor = vec4(v_color.xyz, alpha);
  }
`;

function createShader(gl, type, shaderSource) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

class SnowFlake {
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

class Snow {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");

    this.projectionMatrix = this.getProjectionMatrix();

    this.snowFlakes = this.createSnowFlakes();

    this.addListeners();
    requestAnimationFrame(this.update.bind(this, this.gl));
  }

  addListeners() {
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.projectionMatrix = this.getProjectionMatrix();
  }

  createSnowFlakes() {
    const count = window.innerWidth / 4;
    const snowFlakes = [];
    for (let i = 0; i < count; i++) {
      snowFlakes.push(new SnowFlake());
    }
    return snowFlakes;
  }

  getProjectionMatrix() {
    let matrix = [];
    mat3.identity(matrix);
    mat3.projection(
      matrix,
      this.gl.canvas.clientWidth,
      this.gl.canvas.clientHeight
    );
    return matrix;
  }

  get snowFlakesProps() {
    let snowFlakesProps = [];
    for (let snowFlake of this.snowFlakes) {
      snowFlakesProps = [...snowFlakesProps, ...snowFlake.props];
    }
    return snowFlakesProps;
  }

  update(gl) {
    this.snowFlakes.forEach(snowFlake => snowFlake.update());

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    const program = createProgram(gl, vertexShader, fragmentShader);

    const snowFlakePropsAttribLocation = gl.getAttribLocation(
      program,
      "a_snowFlakeProps"
    );

    const projectionMatrixUniformLocation = gl.getUniformLocation(
      program,
      "u_projectionMatrix"
    );

    const snowFlakePropsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, snowFlakePropsBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.snowFlakesProps),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(snowFlakePropsBuffer);
    const [size, type, normalize, stride, offset] = [4, gl.FLOAT, false, 0, 0];
    gl.vertexAttribPointer(
      snowFlakePropsAttribLocation,
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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniformMatrix3fv(
      projectionMatrixUniformLocation,
      false,
      this.projectionMatrix
    );

    const [mode, offset2, count] = [gl.POINTS, 0, this.snowFlakes.length];
    gl.drawArrays(mode, offset2, count);

    if (!recording) {
      recording = true;
      capturer.start();
    }
    capturer.capture(this.canvas);

    requestAnimationFrame(this.update.bind(this, gl));
  }
}

setTimeout(() => {
  capturer.stop();
  capturer.save();
}, 100000);

let canvas = document.querySelector("canvas");
new Snow(canvas);
