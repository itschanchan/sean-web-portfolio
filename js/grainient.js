function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ];
}

const vertexSrc = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentSrc = `
  precision highp float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uTimeSpeed;
  uniform vec3 uColor1; // lavender
  uniform vec3 uColor2; // peach
  uniform vec3 uColor3; // sky
  uniform vec3 uBaseColor; // Base background

  // soft radial blob
  float blob(vec2 uv, vec2 pos, float radius, float blur) {
    float d = distance(uv, pos);
    return smoothstep(radius, radius - blur, d);
  }

  vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}    
  float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}

  void main(){
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    // subtle movement like your reference
    float t = iTime * uTimeSpeed;
    uv += (noise(uv * 2.0 + t) - 0.5) * 0.03;

    // base (light background)
    vec3 col = uBaseColor;

    // three radial gradients (like your CSS reference)
    float b1 = blob(uv, vec2(0.2, 0.3), 0.5, 0.6);
    float b2 = blob(uv, vec2(0.8, 0.7), 0.5, 0.6);
    float b3 = blob(uv, vec2(0.5, 0.5), 0.8, 0.9);

    col = mix(col, uColor1, b1 * 0.6);
    col = mix(col, uColor2, b2 * 0.6);
    col = mix(col, uColor3, b3 * 0.6);

    // subtle grain
    float g = noise(uv * 200.0) * 0.04;
    col += g;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function initGrainient() {
  const container = document.getElementById('grainient');
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL not supported');
    return;
  }

  const program = createProgram(gl, vertexSrc, fragmentSrc);
  gl.useProgram(program);

  const position = gl.getAttribLocation(program, 'position');

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1,  1,
      -1,  1,
      1, -1,
      1,  1
    ]),
    gl.STATIC_DRAW
  );

  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const iResolution = gl.getUniformLocation(program, 'iResolution');
  const iTime = gl.getUniformLocation(program, 'iTime');
  const uTimeSpeed = gl.getUniformLocation(program, 'uTimeSpeed');
  const uColor1 = gl.getUniformLocation(program, 'uColor1');
  const uColor2 = gl.getUniformLocation(program, 'uColor2');
  const uColor3 = gl.getUniformLocation(program, 'uColor3');
  const uBaseColor = gl.getUniformLocation(program, 'uBaseColor');

  // Color Configurations
  const themes = {
    light: {
      c1: hexToRgb('#FF9FFC'),
      c2: hexToRgb('#5227FF'),
      c3: hexToRgb('#B19EEF'),
      base: [0.97, 0.97, 0.98]
    },
    dark: {
      c1: hexToRgb('#4A148C'), // Deep Purple
      c2: hexToRgb('#1A237E'), // Deep Indigo
      c3: hexToRgb('#311B92'), // Dark Violet
      base: [0.05, 0.05, 0.08] // Almost Black
    }
  };

  function updateThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDark ? themes.dark : themes.light;

    gl.uniform3fv(uColor1, theme.c1);
    gl.uniform3fv(uColor2, theme.c2);
    gl.uniform3fv(uColor3, theme.c3);
    gl.uniform3fv(uBaseColor, theme.base);
  }

  // Initial Set
  updateThemeColors();
  gl.uniform1f(uTimeSpeed, 0.25);

  // Listen for Theme Change
  window.addEventListener('theme-changed', () => {
    updateThemeColors();
  });

  // Observe HTML attribute changes to catch delayed theme updates from header.html
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateThemeColors();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(iResolution, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  resize();

  let start = performance.now();

  function render(now) {
    const t = (now - start) * 0.001;
    gl.uniform1f(iTime, t);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

initGrainient();