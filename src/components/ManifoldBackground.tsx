import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';

const ManifoldBackground = ({ theme: propTheme }) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  // 1. SHADER CODES (DEFINED IN RN)
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

      const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
  
      vec4 qsqr(vec4 a) {
        return vec4(a.x*a.x - a.y*a.y - a.z*a.z - a.w*a.w, 2.0*a.x*a.y, 2.0*a.x*a.z, 2.0*a.x*a.w);
      }
  
      float map(vec3 p) {
        vec4 z = vec4(p, 0.0);
        vec4 c = vec4(0.45 * cos(time*0.3), 0.55 * sin(time*0.2), 0.45 * sin(time*0.5), 0.1);
        float dr = 1.0;
        float r = 0.0;
        // OPTIMIZATION: Reduced iterations from 7 to 5
        for (int i = 0; i < 5; i++) {
          r = length(z);
          if (r > 2.0) break;
          dr = 2.0 * r * dr;
          z = qsqr(z) + c;
        }
        return 0.5 * log(r) * r / dr;
      }
  
      vec3 calcNormal(vec3 p) {
        float h = 0.001;
        vec2 k = vec2(1.0, -1.0);
        return normalize(k.xyy * map(p + k.xyy*h) + k.yyx * map(p + k.yyx*h) + k.yxy * map(p + k.yxy*h) + k.xxx * map(p + k.xxx*h));
      }
  
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        vec3 ro = vec3(0.0, 0.0, 2.8);
        vec3 rd = normalize(vec3(uv, -1.0));
        
        float t = time * 0.1;
        mat2 rot = mat2(cos(t), sin(t), -sin(t), cos(t));
        ro.xz *= rot;
        rd.xz *= rot;
        
        float d = 0.0;
        float t_march = 0.0;
        int steps = 0;
        
        // OPTIMIZATION: Reduced steps from 64 to 48
        for(int i=0; i<48; i++) {
          vec3 p = ro + rd * t_march;
          d = map(p);
          if(d < 0.002 || t_march > 10.0) break;
          t_march += d;
          steps = i;
        }
  
        vec3 col = vec3(0.02, 0.02, 0.05);
        
        if(t_march < 10.0) {
          vec3 p = ro + rd * t_march;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(n, lightDir), 0.0);
          
          float glow = float(steps) / 64.0;
          vec3 baseColor = mix(color1, color2, glow * 2.0);
          
          col = baseColor * (diff * 0.8 + 0.2);
          col = mix(col, vec3(0.0), 1.0 - exp(-0.1 * t_march * t_march));
        }
  
        gl_FragColor = vec4(col, 1.0);
      }
    `;
  
    // 2. HTML CONTENT (INJECTED SAFELY)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background: #000; overflow: hidden; }
          canvas { width: 100vw; height: 100vh; display: block; }
        </style>
      </head>
      <body>
        <canvas id="gl"></canvas>
        <script>
          const canvas = document.getElementById('gl');
          const gl = canvas.getContext('webgl');
  
          if (!gl) { console.error("WebGL not supported"); }
  
          // OPTIMIZATION: Cap DPI at 1.5 for performance
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
        // SAFELY INJECT SHADERS AS JS STRINGS
        const vsSource = ${JSON.stringify(vertexShaderSource)};
        const fsSource = ${JSON.stringify(fragmentShaderSource)};

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

        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        
        const posLoc = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const resLoc = gl.getUniformLocation(program, "resolution");
        const timeLoc = gl.getUniformLocation(program, "time");
        const c1Loc = gl.getUniformLocation(program, "color1");
        const c2Loc = gl.getUniformLocation(program, "color2");

        function hexToRgb(hex) {
          const bigint = parseInt(hex.replace('#', ''), 16);
          return [(bigint >> 16 & 255)/255, (bigint >> 8 & 255)/255, (bigint & 255)/255];
        }
        
        const c1 = hexToRgb('${theme.primary}');
        const c2 = hexToRgb('${theme.accent}');

        function render(now) {
          gl.uniform2f(resLoc, canvas.width, canvas.height);
          gl.uniform1f(timeLoc, now * 0.001);
          gl.uniform3f(c1Loc, c1[0], c1[1], c1[2]);
          gl.uniform3f(c2Loc, c2[0], c2[1], c2[2]);
          
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container} pointerEvents="none">
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ backgroundColor: '#000' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, 
  }
});

export default ManifoldBackground;