/**
 * WebGL Grainient - High Performance Background
 * Renders a gradient and noise directly on the GPU to free up the CPU main thread.
 */
(function() {
    // --- Configuration: Adjust variables here ---
    const config = {
        grainStrength: 0.04,  // Intensity of the noise/grain
        animationSpeed: 0.2,  // Speed of the blob movement
        colors: {
            light: {
                bg: '#EBEBF0',      // Light Gray/White
                c1: '#D9CCE6',      // Soft Purple
                c2: '#CCE0EB'       // Soft Blue
            },
            dark: {
                bg: '#05050D',      // Deep Dark Blue/Black
                c1: '#260D40',      // Deep Purple Glow
                c2: '#0D2633'       // Deep Teal Glow
            }
        }
    };

    const container = document.getElementById('grainient');
    if (!container) return;

    // Helper: Convert Hex (#RRGGBB) to WebGL Normalized RGB ([0..1, 0..1, 0..1])
    function hexToWebgl(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [0, 0, 0];
    }

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.warn('WebGL not supported, gradient disabled.');
        return;
    }

    // --- Shaders ---

    const vsSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;

    const fsSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_speed;
        uniform float u_grain;
        uniform vec3 u_bg;
        uniform vec3 u_c1;
        uniform vec3 u_c2;

        // Pseudo-random noise function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            
            // Slow down time for a relaxed feel
            float t = u_time * u_speed;
            
            // Define moving color points
            vec2 p1 = vec2(0.5 + 0.4 * sin(t), 0.5 + 0.4 * cos(t * 0.8));
            vec2 p2 = vec2(0.5 + 0.4 * cos(t * 1.2), 0.5 + 0.4 * sin(t * 0.9));
            
            // Base Colors (Dark Theme Match)
            vec3 bg = u_bg;
            vec3 color1 = u_c1;
            vec3 color2 = u_c2;
            
            // Calculate distance for soft radial gradients
            float d1 = distance(st, p1);
            float d2 = distance(st, p2);
            
            // Mix colors
            vec3 color = bg;
            color = mix(color, color1, smoothstep(0.8, 0.0, d1));
            color = mix(color, color2, smoothstep(0.8, 0.0, d2));
            
            // Add animated noise (Film Grain)
            float noise = random(st + t);
            float grainStrength = u_grain;
            
            color += (noise - 0.5) * grainStrength;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // --- WebGL Setup Helpers ---

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
        return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const speedLocation = gl.getUniformLocation(program, "u_speed");
    const grainLocation = gl.getUniformLocation(program, "u_grain");
    const bgLocation = gl.getUniformLocation(program, "u_bg");
    const c1Location = gl.getUniformLocation(program, "u_c1");
    const c2Location = gl.getUniformLocation(program, "u_c2");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    // --- Render Loop ---

    function render(time) {
        // Handle Resize
        if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, time * 0.001);

        // Determine Theme (Dark/Light)
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const palette = isDark ? config.colors.dark : config.colors.light;

        gl.uniform1f(speedLocation, config.animationSpeed);
        gl.uniform1f(grainLocation, config.grainStrength);
        gl.uniform3fv(bgLocation, hexToWebgl(palette.bg));
        gl.uniform3fv(c1Location, hexToWebgl(palette.c1));
        gl.uniform3fv(c2Location, hexToWebgl(palette.c2));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();