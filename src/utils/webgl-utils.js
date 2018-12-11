export const vertexShaderSource = `#version 300 es
  in mat3 a_transformMatrix;
  in vec4 a_color;

  out vec4 v_color;

  void main() {
    gl_Position = vec4((a_transformMatrix * vec3(0, 0, 1)).xy, 0, 1);
    // v_color = a_color;
    v_color = vec4(1, 1, 1, 1);
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision mediump float;

  in vec4 v_color;
  out vec4 outColor;

  void main() {
    outColor = v_color;
  }
`;

export const flakeVertexShaderSource = `#version 300 es
  in vec2 a_vertice;
  in vec4 a_color;
  uniform mat3 u_projectionMatrix;
  uniform vec2 u_translation;
  uniform float u_rotation;
  uniform vec2 u_scaling;

  out vec4 v_color;

  void main() {
    v_color = vec4(1, 1, 1, 1);

    mat3 translationMatrix = mat3(
      1, 0, 0,
      0, 1, 0,
      u_translation[0], u_translation[1], 1);
    mat3 rotationMatrix = mat3(
      cos(u_rotation), -sin(u_rotation), 0,
      sin(u_rotation), cos(u_rotation), 0,
      0, 0, 1);
    mat3 scalingMatrix = mat3(
      u_scaling[0], 0, 0,
      0, u_scaling[1], 0,
      0, 0, 1);

    mat3 transformMatrix = u_projectionMatrix * translationMatrix * rotationMatrix * scalingMatrix;

    gl_Position = vec4((transformMatrix * vec3(a_vertice, 1)).xy, 0, 1);
  }
`;

export const flakeFragmentShaderSource = `#version 300 es
  precision mediump float;

  in vec4 v_color;
  out vec4 outColor;

  void main() {
    outColor = v_color;
  }
`;

export function createShader(gl, type, shaderSource) {
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

export function createProgram(gl, vertexShader, fragmentShader) {
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
