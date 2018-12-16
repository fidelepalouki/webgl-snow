export const vertexShaderSource = `#version 300 es
  in vec4 a_snowFlakeProps;
  uniform mat3 u_projectionMatrix;
  out vec4 v_color;

  void main() {
    gl_Position = vec4((u_projectionMatrix * vec3(a_snowFlakeProps.xy, 1)).xy, 0, 1);
    gl_PointSize = 2.0 * a_snowFlakeProps.z;
    v_color = vec4(1, 1, 1, a_snowFlakeProps.w);
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision mediump float;
  in vec4 v_color;

  out vec4 outColor;

  void main() {
    vec2 distToCenter = gl_PointCoord - vec2(0.5, 0.5);
    float distToCenterSquared = dot(distToCenter, distToCenter);
    float alpha;

    if (distToCenterSquared < 0.25) {
      alpha = v_color.w;
    } else {
      alpha = 0.0;
    }

    outColor = vec4(v_color.xyz, alpha);
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
