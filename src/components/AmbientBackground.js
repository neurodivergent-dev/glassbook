import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// --- 3D MATH HELPERS ---
const rotateX = (point, theta) => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos
  };
};

const rotateY = (point, theta) => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos
  };
};

const rotateZ = (point, theta) => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
    z: point.z
  };
};

const project = (point, size) => {
  const fov = 300;
  const distance = 2.5;
  const scale = fov / (fov + point.z + distance);
  return {
    x: point.x * scale * size + width / 2,
    y: point.y * scale * size + height / 2,
    z: point.z
  };
};

const Line = ({ p1, p2, color, thickness = 1.5, opacity = 0.6 }) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  if (length < 0.1) return null;
  
  return (
    <View style={{
      position: 'absolute',
      left: p1.x,
      top: p1.y,
      width: length,
      height: thickness,
      backgroundColor: color,
      opacity: opacity,
      transformOrigin: 'left center',
      transform: [{ rotate: `${angle}deg` }],
    }} />
  );
};

const WireframeCube = ({ theme, size = 80 }) => {
  const [lines, setLines] = useState([]);
  const angleX = useRef(0);
  const angleY = useRef(0);
  const angleZ = useRef(0);

  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      angleX.current += 0.006;
      angleY.current += 0.009;
      angleZ.current += 0.004;

      const vertices = [
        { x: -1, y: -1, z: -1 }, { x:  1, y: -1, z: -1 },
        { x:  1, y:  1, z: -1 }, { x: -1, y:  1, z: -1 },
        { x: -1, y: -1, z:  1 }, { x:  1, y: -1, z:  1 },
        { x:  1, y:  1, z:  1 }, { x: -1, y:  1, z:  1 },
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateX(vertices[i1], angleX.current);
        r1 = rotateY(r1, angleY.current);
        r1 = rotateZ(r1, angleZ.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(vertices[i2], angleX.current);
        r2 = rotateY(r2, angleY.current);
        r2 = rotateZ(r2, angleZ.current);
        const proj2 = project(r2, size);

        const avgZ = (proj1.z + proj2.z) / 2;
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: avgZ };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={2} opacity={0.7} />
      ))}
    </View>
  );
};

const WireframeSphere = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleX = useRef(0);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      angleX.current += 0.005;
      angleY.current += 0.008;

      const allLines = [];
      const segments = 12;

      for (let i = 0; i <= segments; i++) {
        const lat = (Math.PI * i) / segments - Math.PI / 2;
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);

        for (let j = 0; j < segments; j++) {
          const lon1 = (2 * Math.PI * j) / segments;
          const lon2 = (2 * Math.PI * (j + 1)) / segments;

          const x1 = cosLat * Math.cos(lon1);
          const y1 = sinLat;
          const z1 = cosLat * Math.sin(lon1);

          const x2 = cosLat * Math.cos(lon2);
          const y2 = sinLat;
          const z2 = cosLat * Math.sin(lon2);

          allLines.push({
            p1: { x: x1, y: y1, z: z1 },
            p2: { x: x2, y: y2, z: z2 }
          });
        }
      }

      for (let j = 0; j < segments; j++) {
        const lon = (2 * Math.PI * j) / segments;
        for (let i = 0; i < segments; i++) {
          const lat1 = (Math.PI * i) / segments - Math.PI / 2;
          const lat2 = (Math.PI * (i + 1)) / segments - Math.PI / 2;

          const x1 = Math.cos(lat1) * Math.cos(lon);
          const y1 = Math.sin(lat1);
          const z1 = Math.cos(lat1) * Math.sin(lon);

          const x2 = Math.cos(lat2) * Math.cos(lon);
          const y2 = Math.sin(lat2);
          const z2 = Math.cos(lat2) * Math.sin(lon);

          allLines.push({
            p1: { x: x1, y: y1, z: z1 },
            p2: { x: x2, y: y2, z: z2 }
          });
        }
      }

      const projectedLines = allLines.map(line => {
        let r1 = rotateX(line.p1, angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(line.p2, angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);

        const avgZ = (proj1.z + proj2.z) / 2;
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: avgZ };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1} opacity={0.4} />
      ))}
    </View>
  );
};

// --- WIREFRAME DNA ---
const WireframeDNA = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      angleY.current += 0.02;

      const allLines = [];
      const turns = 2.5;
      const pointsPerTurn = 12;
      const totalPoints = turns * pointsPerTurn;
      const heightStep = 2.5 / totalPoints;
      const radius = 0.5;

      for (let i = 0; i < totalPoints; i++) {
        const t = (i / pointsPerTurn) * Math.PI * 2;
        const y = (i * heightStep) - 1.25;

        // Strand 1
        const x1 = Math.cos(t) * radius;
        const z1 = Math.sin(t) * radius;
        
        // Strand 2 (offset by PI)
        const x2 = Math.cos(t + Math.PI) * radius;
        const z2 = Math.sin(t + Math.PI) * radius;

        // Base pair line
        allLines.push({
          p1: { x: x1, y, z: z1 },
          p2: { x: x2, y, z: z2 },
          isBasePair: true
        });

        // Strand connections (to next point)
        if (i < totalPoints - 1) {
          const tNext = ((i + 1) / pointsPerTurn) * Math.PI * 2;
          const yNext = ((i + 1) * heightStep) - 1.25;
          
          const x1Next = Math.cos(tNext) * radius;
          const z1Next = Math.sin(tNext) * radius;

          const x2Next = Math.cos(tNext + Math.PI) * radius;
          const z2Next = Math.sin(tNext + Math.PI) * radius;

          allLines.push({
             p1: { x: x1, y, z: z1 },
             p2: { x: x1Next, y: yNext, z: z1Next },
             isStrand: true
          });
           allLines.push({
             p1: { x: x2, y, z: z2 },
             p2: { x: x2Next, y: yNext, z: z2Next },
             isStrand: true
          });
        }
      }

      const projectedLines = allLines.map(line => {
        let r1 = rotateY(line.p1, angleY.current);
        r1 = rotateZ(r1, Math.PI / 6); // Tilt it a bit
        const proj1 = project(r1, size);

        let r2 = rotateY(line.p2, angleY.current);
        r2 = rotateZ(r2, Math.PI / 6);
        const proj2 = project(r2, size);

        const avgZ = (proj1.z + proj2.z) / 2;
        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: avgZ,
          isStrand: line.isStrand
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.isStrand ? theme.primary : theme.accent} 
          thickness={line.isStrand ? 2 : 1} 
          opacity={line.isStrand ? 0.8 : 0.5} 
        />
      ))}
    </View>
  );
};

// --- AI HEAD ---
export const AIHead = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleX = useRef(0);
  const angleY = useRef(0.3); // Slight initial rotation

  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      angleY.current += 0.008; // Rotating head

      // Low-poly human head vertices (simplified)
      const vertices = [
        // Top of head
        { x: 0, y: 1.2, z: 0 },      // 0: top center
        { x: 0.4, y: 1.0, z: 0.3 },  // 1: top right front
        { x: -0.4, y: 1.0, z: 0.3 }, // 2: top left front
        { x: 0.4, y: 1.0, z: -0.3 }, // 3: top right back
        { x: -0.4, y: 1.0, z: -0.3 },// 4: top left back
        
        // Forehead
        { x: 0.5, y: 0.6, z: 0.4 },  // 5: right forehead
        { x: -0.5, y: 0.6, z: 0.4 }, // 6: left forehead
        { x: 0.5, y: 0.6, z: -0.4 }, // 7: right back head
        { x: -0.5, y: 0.6, z: -0.4 },// 8: left back head
        
        // Eyes level
        { x: 0.6, y: 0.2, z: 0.3 },  // 9: right cheek
        { x: -0.6, y: 0.2, z: 0.3 }, // 10: left cheek
        { x: 0.3, y: 0.2, z: 0.5 },  // 11: right eye
        { x: -0.3, y: 0.2, z: 0.5 }, // 12: left eye
        
        // Nose
        { x: 0, y: -0.1, z: 0.6 },   // 13: nose tip
        
        // Mouth/Jaw
        { x: 0.5, y: -0.3, z: 0.3 }, // 14: right jaw
        { x: -0.5, y: -0.3, z: 0.3 },// 15: left jaw
        { x: 0, y: -0.5, z: 0.4 },   // 16: chin
        { x: 0.4, y: -0.3, z: -0.2 },// 17: right jaw back
        { x: -0.4, y: -0.3, z: -0.2 },// 18: left jaw back
        
        // Neck
        { x: 0.3, y: -0.8, z: 0 },   // 19: right neck
        { x: -0.3, y: -0.8, z: 0 },  // 20: left neck
      ];

      // Edges defining head structure
      const edges = [
        // Top skull
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [3, 4], [1, 3], [2, 4],
        
        // Skull to forehead
        [1, 5], [2, 6], [3, 7], [4, 8],
        [5, 6], [7, 8], [5, 7], [6, 8],
        
        // Face structure
        [5, 9], [6, 10], [5, 11], [6, 12],
        [9, 11], [10, 12], [11, 12], // Eyes
        [9, 10], // Cheeks
        
        // Nose
        [11, 13], [12, 13], [13, 16],
        
        // Jaw
        [9, 14], [10, 15], [14, 15],
        [14, 16], [15, 16],
        [9, 17], [10, 18], [17, 18],
        
        // Neck
        [14, 19], [15, 20], [17, 19], [18, 20],
        [19, 20],
        
        // Back of head
        [7, 17], [8, 18],
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateX(vertices[i1], angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(vertices[i2], angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);

        const avgZ = (proj1.z + proj2.z) / 2;
        
        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: avgZ
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={theme.primary} 
          thickness={1.5} 
          opacity={0.6} 
        />
      ))}
    </View>
  );
};

// --- PARTICLES ---
const Particles = ({ theme }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.5 + 0.1
    }));
  }, []);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -height * p.speed]
        });
        
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y, // Start pos
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: i % 2 === 0 ? theme.primary : theme.accent,
              opacity: p.opacity,
              transform: [{ translateY }]
            }}
          />
        );
      })}
    </View>
  );
};

// --- MATRIX RAIN ---
const MatrixRain = ({ theme }) => {
  const columns = Math.floor(width / 20);
  const drops = useMemo(() => Array.from({ length: columns }).map(() => ({
    delay: Math.random() * 5000,
    duration: 3000 + Math.random() * 2000,
    x: Math.random() * width
  })), [columns]);

  return (
    <View style={StyleSheet.absoluteFill}>
       {drops.map((drop, i) => {
         const anim = useRef(new Animated.Value(-100)).current;
         
         useEffect(() => {
           Animated.loop(
             Animated.timing(anim, {
               toValue: height + 100,
               duration: drop.duration,
               delay: drop.delay,
               easing: Easing.linear,
               useNativeDriver: true
             })
           ).start();
         }, []);

         return (
           <Animated.View 
              key={i}
              style={{
                position: 'absolute',
                left: drop.x,
                top: 0,
                width: 2,
                height: 60,
                opacity: 0.3,
                transform: [{ translateY: anim }]
              }}
            >
              <LinearGradient 
                colors={['transparent', theme.primary, 'transparent']} 
                style={{ flex: 1 }}
              />
            </Animated.View>
         );
       })}
    </View>
  );
};

// --- RETRO PC ---
const WireframeRetroPC = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(-0.5);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const vertices = [
        // MONITOR BODY (Y: -0.7 to 0.2)
        { x: -0.6, y: -0.6, z: -0.6 }, { x:  0.6, y: -0.6, z: -0.6 }, // 0, 1: top back
        { x:  0.6, y:  0.3, z: -0.6 }, { x: -0.6, y:  0.3, z: -0.6 }, // 2, 3: bottom back
        { x: -0.7, y: -0.7, z:  0.2 }, { x:  0.7, y: -0.7, z:  0.2 }, // 4, 5: top front bezel
        { x:  0.7, y:  0.4, z:  0.2 }, { x: -0.7, y:  0.4, z:  0.2 }, // 6, 7: bottom front bezel
        
        // SCREEN
        { x: -0.55, y: -0.55, z: 0.22 }, { x: 0.55, y: -0.55, z: 0.22 }, // 8, 9
        { x: 0.55, y: 0.3, z: 0.22 }, { x: -0.55, y: 0.3, z: 0.22 },     // 10, 11
        
        // KEYBOARD (Y: 0.5 to 0.7)
        { x: -0.8, y: 0.5, z: 0.4 }, { x: 0.8, y: 0.5, z: 0.4 }, // 12, 13: back top
        { x: -0.8, y: 0.6, z: 0.4 }, { x: 0.8, y: 0.6, z: 0.4 }, // 14, 15: back bottom
        { x: -0.85, y: 0.7, z: 1.1 }, { x: 0.85, y: 0.7, z: 1.1 }, // 16, 17: front top (tilted)
        { x: -0.85, y: 0.8, z: 1.1 }, { x: 0.85, y: 0.8, z: 1.1 }, // 18, 19: front bottom

        // MOUSE (placed to the right of keyboard)
        { x: 1.0, y: 0.8, z: 0.75 }, { x: 1.25, y: 0.8, z: 0.75 },  // 20, 21: bottom back
        { x: 1.25, y: 0.8, z: 1.0 }, { x: 1.0, y: 0.8, z: 1.0 },    // 22, 23: bottom front
        { x: 1.0, y: 0.72, z: 0.75 }, { x: 1.25, y: 0.72, z: 0.75 },// 24, 25: top back
        { x: 1.25, y: 0.76, z: 1.0 }, { x: 1.0, y: 0.76, z: 1.0 },  // 26, 27: top front

        // TABLE SURFACE (Y: 0.82)
        { x: -1.6, y: 0.82, z: -0.8 }, { x: 1.6, y: 0.82, z: -0.8 }, // 28, 29: back corners
        { x: 1.6, y: 0.82, z: 1.3 }, { x: -1.6, y: 0.82, z: 1.3 },   // 30, 31: front corners
      ];

      const edges = [
        // Monitor Body
        [0, 1], [1, 2], [2, 3], [3, 0], // back
        [4, 5], [5, 6], [6, 7], [7, 4], // bezel
        [0, 4], [1, 5], [2, 6], [3, 7], // connectors
        // Screen
        [8, 9], [9, 10], [10, 11], [11, 8],
        // Keyboard
        [12, 13], [13, 17], [17, 16], [16, 12], // top surface
        [14, 15], [15, 19], [19, 18], [18, 14], // bottom surface
        [12, 14], [13, 15], [16, 18], [17, 19], // vertical connectors
        // Mouse
        [20, 21], [21, 22], [22, 23], [23, 20], // bottom
        [24, 25], [25, 26], [26, 27], [27, 24], // top
        [20, 24], [21, 25], [22, 26], [23, 27], // vertical connectors
        [24, 27], // button separator
        // Table frame
        [28, 29], [29, 30], [30, 31], [31, 28],
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        const avgZ = (proj1.z + proj2.z) / 2;
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: avgZ, isTable: i1 >= 28 };
      });

      // Add Table Grid Lines
      for (let gx = -1.2; gx <= 1.2; gx += 0.4) {
        let r1 = rotateY({ x: gx, y: 0.82, z: -0.8 }, angleY.current);
        let r2 = rotateY({ x: gx, y: 0.82, z: 1.3 }, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, isTable: true });
      }
      for (let gz = -0.4; gz <= 0.8; gz += 0.4) {
        let r1 = rotateY({ x: -1.6, y: 0.82, z: gz }, angleY.current);
        let r2 = rotateY({ x: 1.6, y: 0.82, z: gz }, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, isTable: true });
      }

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={theme.primary} 
          thickness={line.isTable ? 1 : 1.5} 
          opacity={line.isTable ? 0.3 : 0.6} 
        />
      ))}
    </View>
  );
};

// --- KEYPAD PHONE ---
const WireframeKeypadPhone = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const angleX = useRef(0.2);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.015;

      const vertices = [
        // BODY
        { x: -0.4, y: -0.8, z: -0.1 }, { x:  0.4, y: -0.8, z: -0.1 }, // 0, 1: top back
        { x:  0.4, y:  0.8, z: -0.1 }, { x: -0.4, y:  0.8, z: -0.1 }, // 2, 3: bottom back
        { x: -0.4, y: -0.8, z:  0.1 }, { x:  0.4, y: -0.8, z:  0.1 }, // 4, 5: top front
        { x:  0.4, y:  0.8, z:  0.1 }, { x: -0.4, y:  0.8, z:  0.1 }, // 6, 7: bottom front
        
        // SCREEN
        { x: -0.32, y: -0.72, z: 0.11 }, { x: 0.32, y: -0.72, z: 0.11 }, // 8, 9: top
        { x: 0.32, y: -0.1, z: 0.11 }, { x: -0.32, y: -0.1, z: 0.11 },   // 10, 11: bottom
        
        // ANTENNA
        { x: 0.25, y: -0.8, z: -0.05 }, { x: 0.25, y: -1.0, z: -0.05 },  // 12, 13
      ];

      const edges = [
        // Body
        [0, 1], [1, 2], [2, 3], [3, 0], // back
        [4, 5], [5, 6], [6, 7], [7, 4], // front
        [0, 4], [1, 5], [2, 6], [3, 7], // connectors
        // Screen
        [8, 9], [9, 10], [10, 11], [11, 8],
        // Antenna
        [12, 13]
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateX(vertices[i1], angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateX(vertices[i2], angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      // KEYPAD GRID
      for (let gy = 0.1; gy <= 0.7; gy += 0.2) {
        let r1 = rotateX({ x: -0.3, y: gy, z: 0.11 }, angleX.current);
        r1 = rotateY(r1, angleY.current);
        let r2 = rotateX({ x: 0.3, y: gy, z: 0.11 }, angleX.current);
        r2 = rotateY(r2, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2 });
      }
      for (let gx = -0.3; gx <= 0.3; gx += 0.2) {
        let r1 = rotateX({ x: gx, y: 0.1, z: 0.11 }, angleX.current);
        r1 = rotateY(r1, angleY.current);
        let r2 = rotateX({ x: gx, y: 0.7, z: 0.11 }, angleX.current);
        r2 = rotateY(r2, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2 });
      }

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.2} opacity={0.6} />
      ))}
    </View>
  );
};

// --- WIREFRAME HOUSE ---
const WireframeHouse = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const vertices = [
        // MAIN BODY
        { x: -0.6, y:  0.6, z: -0.6 }, { x:  0.6, y:  0.6, z: -0.6 }, // 0, 1: bottom back
        { x:  0.6, y:  0.6, z:  0.6 }, { x: -0.6, y:  0.6, z:  0.6 }, // 2, 3: bottom front
        { x: -0.6, y: -0.2, z: -0.6 }, { x:  0.6, y: -0.2, z: -0.6 }, // 4, 5: top back
        { x:  0.6, y: -0.2, z:  0.6 }, { x: -0.6, y: -0.2, z:  0.6 }, // 6, 7: top front

        // ROOF
        { x:  0,   y: -0.8, z: -0.6 }, { x:  0,   y: -0.8, z:  0.6 }, // 8, 9: roof ridge

        // CHIMNEY
        { x:  0.2, y: -0.5, z: -0.3 }, { x:  0.4, y: -0.5, z: -0.3 }, // 10, 11: chimney base back
        { x:  0.4, y: -0.5, z: -0.1 }, { x:  0.2, y: -0.5, z: -0.1 }, // 12, 13: chimney base front
        { x:  0.2, y: -0.9, z: -0.3 }, { x:  0.4, y: -0.9, z: -0.3 }, // 14, 15: chimney top back
        { x:  0.4, y: -0.9, z: -0.1 }, { x:  0.2, y: -0.9, z: -0.1 }, // 16, 17: chimney top front

        // DOOR
        { x: -0.15, y:  0.6, z:  0.61 }, { x:  0.15, y:  0.6, z:  0.61 }, // 18, 19: door bottom
        { x:  0.15, y:  0.2, z:  0.61 }, { x: -0.15, y:  0.2, z:  0.61 }, // 20, 21: door top

        // WINDOW 1 (Front Left)
        { x: -0.45, y:  0.2, z:  0.61 }, { x: -0.25, y:  0.2, z:  0.61 }, // 22, 23: window bottom
        { x: -0.25, y: -0.0, z:  0.61 }, { x: -0.45, y: -0.0, z:  0.61 }, // 24, 25: window top

        // WINDOW 2 (Side Right)
        { x:  0.61, y:  0.2, z: -0.1 }, { x:  0.61, y:  0.2, z:  0.1 },  // 26, 27: window bottom
        { x:  0.61, y: -0.0, z:  0.1 },  { x:  0.61, y: -0.0, z: -0.1 }, // 28, 29: window top
      ];

      const edges = [
        // Body
        [0, 1], [1, 2], [2, 3], [3, 0], // bottom
        [4, 5], [5, 6], [6, 7], [7, 4], // top
        [0, 4], [1, 5], [2, 6], [3, 7], // columns
        
        // Roof
        [4, 8], [5, 8], [6, 9], [7, 9], // roof sides
        [8, 9], // roof ridge
        
        // Chimney
        [14, 15], [15, 16], [16, 17], [17, 14], // chimney top
        [10, 14], [11, 15], [12, 16], [13, 17], // chimney columns
        
        // Door
        [18, 19], [19, 20], [20, 21], [21, 18],

        // Window 1
        [22, 23], [23, 24], [24, 25], [25, 22],
        [22, 24], [23, 25], // cross frame

        // Window 2
        [26, 27], [27, 28], [28, 29], [29, 26],
        [26, 28], [27, 29] // cross frame
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.5} opacity={0.6} />
      ))}
    </View>
  );
};

// --- WIREFRAME TYPEWRITER ---
const WireframeTypewriter = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const angleX = useRef(0.3);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const vertices = [
        // BASE BODY
        { x: -0.7, y:  0.4, z: -0.4 }, { x:  0.7, y:  0.4, z: -0.4 }, // 0, 1: bottom back
        { x:  0.7, y:  0.4, z:  0.5 }, { x: -0.7, y:  0.4, z:  0.5 }, // 2, 3: bottom front
        { x: -0.7, y:  0.1, z: -0.4 }, { x:  0.7, y:  0.1, z: -0.4 }, // 4, 5: top back
        { x:  0.7, y:  0.2, z:  0.1 }, { x: -0.7, y:  0.2, z:  0.1 }, // 6, 7: top middle (start of keyboard slope)
        { x: -0.7, y:  0.35,z:  0.5 }, { x:  0.7, y:  0.35,z:  0.5 }, // 8, 9: front edge
        
        // CARRIAGE (cylinder-like bar)
        { x: -0.8, y: -0.05,z: -0.4 }, { x:  0.8, y: -0.05,z: -0.4 }, // 10, 11: carriage back top
        { x:  0.8, y:  0.15,z: -0.4 }, { x: -0.8, y:  0.15,z: -0.4 }, // 12, 13: carriage back bottom
        { x: -0.8, y: -0.05,z: -0.25}, { x:  0.8, y: -0.05,z: -0.25}, // 14, 15: carriage front top
        { x:  0.8, y:  0.15,z: -0.25}, { x: -0.8, y:  0.15,z: -0.25}, // 16, 17: carriage front bottom

        // PAPER
        { x: -0.4, y: -0.05, z: -0.32 }, { x:  0.4, y: -0.05, z: -0.32 }, // 18, 19: paper base
        { x:  0.4, y: -0.7,  z: -0.32 }, { x: -0.4, y: -0.7,  z: -0.32 }, // 20, 21: paper top
      ];

      const edges = [
        // Body
        [0, 1], [1, 2], [2, 3], [3, 0], // bottom
        [4, 5], [5, 6], [6, 7], [7, 4], // top back/mid
        [6, 9], [9, 8], [8, 7],         // front slope
        [0, 4], [1, 5], [2, 9], [3, 8], // vertical/side connectors
        
        // Carriage
        [10, 11], [11, 12], [12, 13], [13, 10], // back face
        [14, 15], [15, 16], [16, 17], [17, 14], // front face
        [10, 14], [11, 15], [12, 16], [13, 17], // connectors
        
        // Paper
        [18, 19], [19, 20], [20, 21], [21, 18]
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateX(vertices[i1], angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateX(vertices[i2], angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      // KEYBOARD KEYS (simplified grid)
      for (let kx = -0.5; kx <= 0.5; kx += 0.25) {
        for (let kz = 0.2; kz <= 0.4; kz += 0.1) {
          const ky = 0.2 + (kz - 0.2) * 1.5; // Slope interpolation
          let r1 = rotateX({ x: kx - 0.05, y: ky, z: kz }, angleX.current);
          r1 = rotateY(r1, angleY.current);
          let r2 = rotateX({ x: kx + 0.05, y: ky, z: kz }, angleX.current);
          r2 = rotateY(r2, angleY.current);
          const p1 = project(r1, size);
          const p2 = project(r2, size);
          projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2 });
        }
      }

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.3} opacity={0.6} />
      ))}
    </View>
  );
};

// --- WIREFRAME ROSE IN POT ---
const WireframeRoseInPot = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const allLines = [];
      const segments = 12;

      // POT (Trapezoid container)
      const potTopR = 0.5;
      const potBottomR = 0.35;
      const potTopY = 0.4;
      const potBottomY = 0.8;

      for (let i = 0; i < segments; i++) {
        const theta1 = (i * 2 * Math.PI) / segments;
        const theta2 = ((i + 1) * 2 * Math.PI) / segments;

        // Top circle
        allLines.push({
          p1: { x: Math.cos(theta1) * potTopR, y: potTopY, z: Math.sin(theta1) * potTopR },
          p2: { x: Math.cos(theta2) * potTopR, y: potTopY, z: Math.sin(theta2) * potTopR },
          isPot: true
        });
        // Bottom circle
        allLines.push({
          p1: { x: Math.cos(theta1) * potBottomR, y: potBottomY, z: Math.sin(theta1) * potBottomR },
          p2: { x: Math.cos(theta2) * potBottomR, y: potBottomY, z: Math.sin(theta2) * potBottomR },
          isPot: true
        });
        // Side connectors
        allLines.push({
          p1: { x: Math.cos(theta1) * potTopR, y: potTopY, z: Math.sin(theta1) * potTopR },
          p2: { x: Math.cos(theta1) * potBottomR, y: potBottomY, z: Math.sin(theta1) * potBottomR },
          isPot: true
        });
      }

      // STEM
      const stemPoints = [
        { x: 0, y: 0.4, z: 0 },
        { x: 0.1, y: 0.1, z: 0.05 },
        { x: -0.05, y: -0.2, z: 0 },
      ];
      for (let i = 0; i < stemPoints.length - 1; i++) {
        allLines.push({ p1: stemPoints[i], p2: stemPoints[i+1], isStem: true });
      }

      // ROSE HEAD (Simplified spiral/cone)
      const roseY = -0.2;
      const petals = 5;
      for (let i = 0; i < petals; i++) {
        const t1 = (i * 2 * Math.PI) / petals;
        const t2 = ((i + 1) * 2 * Math.PI) / petals;
        const r = 0.25;
        
        allLines.push({
          p1: { x: 0, y: roseY, z: 0 },
          p2: { x: Math.cos(t1) * r - 0.05, y: roseY - 0.2, z: Math.sin(t1) * r },
          isRose: true
        });
        allLines.push({
          p1: { x: Math.cos(t1) * r - 0.05, y: roseY - 0.2, z: Math.sin(t1) * r },
          p2: { x: Math.cos(t2) * r - 0.05, y: roseY - 0.2, z: Math.sin(t2) * r },
          isRose: true
        });
      }

      const projectedLines = allLines.map(line => {
        let r1 = rotateY(line.p1, angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(line.p2, angleY.current);
        const proj2 = project(r2, size);
        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: (proj1.z + proj2.z) / 2,
          type: line.isPot ? 'pot' : line.isStem ? 'stem' : 'rose'
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'rose' ? theme.danger : line.type === 'stem' ? theme.success : theme.primary} 
          thickness={line.type === 'pot' ? 1.5 : 2} 
          opacity={0.7} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME GRAMOPHONE ---
const WireframeGramophone = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const allLines = [];
      const segments = 12;

      // BASE BOX
      const baseVertices = [
        { x: -0.6, y: 0.4, z: -0.6 }, { x: 0.6, y: 0.4, z: -0.6 },
        { x: 0.6, y: 0.8, z: -0.6 }, { x: -0.6, y: 0.8, z: -0.6 },
        { x: -0.6, y: 0.4, z: 0.6 }, { x: 0.6, y: 0.4, z: 0.6 },
        { x: 0.6, y: 0.8, z: 0.6 }, { x: -0.6, y: 0.8, z: 0.6 },
      ];
      const baseEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];
      baseEdges.forEach(([i1, i2]) => {
        allLines.push({ p1: baseVertices[i1], p2: baseVertices[i2], type: 'base' });
      });

      // PLATTER (Turntable)
      const platterR = 0.5;
      const platterY = 0.38;
      for (let i = 0; i < segments; i++) {
        const t1 = (i * 2 * Math.PI) / segments;
        const t2 = ((i + 1) * 2 * Math.PI) / segments;
        allLines.push({
          p1: { x: Math.cos(t1) * platterR, y: platterY, z: Math.sin(t1) * platterR },
          p2: { x: Math.cos(t2) * platterR, y: platterY, z: Math.sin(t2) * platterR },
          type: 'platter'
        });
      }

      // HORN (Conical shape curving up)
      const hornPoints = [];
      const hornSegments = 8;
      for (let i = 0; i <= hornSegments; i++) {
        const t = i / hornSegments;
        const r = 0.1 + Math.pow(t, 2) * 0.8; // Expanding
        const hy = 0.3 - t * 0.8; // Rising
        const hz = -0.3 - Math.sin(t * Math.PI / 2) * 0.5; // Curving back
        
        const circle = [];
        for (let j = 0; j < segments; j++) {
          const theta = (j * 2 * Math.PI) / segments;
          circle.push({
            x: Math.cos(theta) * r,
            y: hy + Math.sin(theta) * r * 0.2, // Tilted circles
            z: hz
          });
        }
        hornPoints.push(circle);
      }

      for (let i = 0; i <= hornSegments; i++) {
        for (let j = 0; j < segments; j++) {
          // Circle lines
          allLines.push({ p1: hornPoints[i][j], p2: hornPoints[i][(j + 1) % segments], type: 'horn' });
          // Connector lines to next circle
          if (i < hornSegments) {
            allLines.push({ p1: hornPoints[i][j], p2: hornPoints[i + 1][j], type: 'horn' });
          }
        }
      }

      const projectedLines = allLines.map(line => {
        let r1 = rotateY(line.p1, angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(line.p2, angleY.current);
        const proj2 = project(r2, size);
        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: (proj1.z + proj2.z) / 2,
          type: line.type
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'horn' ? theme.accent : theme.primary} 
          thickness={line.type === 'base' ? 2 : 1.2} 
          opacity={0.6} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME SEA ---
const WireframeSea = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const time = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      time.current += 0.03;

      const allLines = [];
      const gridCount = 10;
      const spacing = 0.3;
      const offset = (gridCount * spacing) / 2;

      const getZ = (x, z) => {
        return Math.sin(x * 2 + time.current) * 0.15 + Math.cos(z * 2 + time.current * 0.8) * 0.15;
      };

      for (let i = 0; i <= gridCount; i++) {
        for (let j = 0; j <= gridCount; j++) {
          const x = i * spacing - offset;
          const z = j * spacing - offset;
          const y = getZ(x, z) + 0.5;

          if (i < gridCount) {
            const nextX = (i + 1) * spacing - offset;
            const nextY = getZ(nextX, z) + 0.5;
            allLines.push({ p1: { x, y, z }, p2: { x: nextX, y: nextY, z } });
          }
          if (j < gridCount) {
            const nextZ = (j + 1) * spacing - offset;
            const nextY = getZ(x, nextZ) + 0.5;
            allLines.push({ p1: { x, y, z }, p2: { x: x, y: nextY, z: nextZ } });
          }
        }
      }

      const projectedLines = allLines.map(line => {
        let r1 = rotateX(line.p1, 0.4);
        r1 = rotateY(r1, time.current * 0.1);
        const proj1 = project(r1, size);

        let r2 = rotateX(line.p2, 0.4);
        r2 = rotateY(r2, time.current * 0.1);
        const proj2 = project(r2, size);

        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1} opacity={0.4} />
      ))}
    </View>
  );
};

// --- WIREFRAME CYBER CITY ---
const WireframeCyberCity = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const cars = useRef(Array.from({ length: 5 }).map(() => ({
    x: Math.random() * 4 - 2,
    y: -Math.random() * 1.5,
    z: Math.random() * 4 - 2,
    speed: 0.02 + Math.random() * 0.03
  })));

  const buildings = useMemo(() => {
    return Array.from({ length: 15 }).map(() => {
      const w = 0.2 + Math.random() * 0.3;
      const h = 0.5 + Math.random() * 2.0;
      const d = 0.2 + Math.random() * 0.3;
      const x = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      return {
        vertices: [
          { x: x - w/2, y: 0, z: z - d/2 }, { x: x + w/2, y: 0, z: z - d/2 },
          { x: x + w/2, y: -h, z: z - d/2 }, { x: x - w/2, y: -h, z: z - d/2 },
          { x: x - w/2, y: 0, z: z + d/2 }, { x: x + w/2, y: 0, z: z + d/2 },
          { x: x + w/2, y: -h, z: z + d/2 }, { x: x - w/2, y: -h, z: z + d/2 },
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ]
      };
    });
  }, []);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.005;
      
      const allLines = [];

      // Buildings
      buildings.forEach(b => {
        b.edges.forEach(([i1, i2]) => {
          let r1 = rotateY(b.vertices[i1], angleY.current);
          const proj1 = project(r1, size);
          let r2 = rotateY(b.vertices[i2], angleY.current);
          const proj2 = project(r2, size);
          
          // Shift down
          proj1.y += height * 0.15;
          proj2.y += height * 0.15;
          
          allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, type: 'building' });
        });
      });

      // Cars
      cars.current.forEach(car => {
        car.x += car.speed;
        if (car.x > 3) car.x = -3;
        
        const v1 = { x: car.x, y: car.y, z: car.z };
        const v2 = { x: car.x - 0.2, y: car.y, z: car.z };
        
        let r1 = rotateY(v1, angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(v2, angleY.current);
        const proj2 = project(r2, size);

        // Shift down
        proj1.y += height * 0.15;
        proj2.y += height * 0.15;

        allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, type: 'car' });
      });

      allLines.sort((a, b) => a.z - b.z);
      setLines(allLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'car' ? theme.accent : theme.primary} 
          thickness={line.type === 'car' ? 2 : 1} 
          opacity={line.type === 'car' ? 0.8 : 0.4} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME SATURN ---
const WireframeSaturn = ({ theme, size = 130 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const angleX = useRef(0.4); // Tilted for better ring view

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.008;

      const allLines = [];
      const segments = 12;
      const rings = 6;

      // PLANET (Sphere)
      for (let i = 0; i <= rings; i++) {
        const phi = (Math.PI * i) / rings;
        for (let j = 0; j < segments; j++) {
          const theta1 = (2 * Math.PI * j) / segments;
          const theta2 = ((j + 1) * 2 * Math.PI) / segments;
          
          const p1 = { x: Math.sin(phi) * Math.cos(theta1), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta1) };
          const p2 = { x: Math.sin(phi) * Math.cos(theta2), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta2) };
          allLines.push({ p1, p2, type: 'planet' });
          
          if (i < rings) {
            const phiNext = (Math.PI * (i + 1)) / rings;
            const pNext = { x: Math.sin(phiNext) * Math.cos(theta1), y: Math.cos(phiNext), z: Math.sin(phiNext) * Math.sin(theta1) };
            allLines.push({ p1, p2: pNext, type: 'planet' });
          }
        }
      }

      // SATURN RINGS (3 concentric rings)
      const ringRadii = [1.4, 1.6, 1.8];
      ringRadii.forEach((radius, ringIdx) => {
        for (let j = 0; j < segments * 2; j++) {
          const theta1 = (2 * Math.PI * j) / (segments * 2);
          const theta2 = (2 * Math.PI * (j + 1)) / (segments * 2);
          
          const p1 = { x: Math.cos(theta1) * radius, y: 0, z: Math.sin(theta1) * radius };
          const p2 = { x: Math.cos(theta2) * radius, y: 0, z: Math.sin(theta2) * radius };
          allLines.push({ p1, p2, type: 'ring' });
        }
      });

      const projectedLines = allLines.map(line => {
        let r1 = rotateX(line.p1, angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(line.p2, angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);

        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: (proj1.z + proj2.z) / 2,
          type: line.type
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'ring' ? theme.accent : theme.primary} 
          thickness={line.type === 'ring' ? 1 : 1.5} 
          opacity={line.type === 'ring' ? 0.4 : 0.6} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME CYBER CAR ---
const WireframeCyberCar = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(-0.3); // Fixed angle for driving view
  const roadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(roadAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: false })
    ).start();

    let animationFrame;
    const animate = () => {
      const roadOffset = roadAnim._value * 0.8;

      const allLines = [];

      // CAR BODY (Simplified sports car shape)
      const carVertices = [
        { x: -0.5, y: 0.6, z: 0.8 }, { x:  0.5, y: 0.6, z: 0.8 }, // 0, 1: front bumper
        { x: -0.5, y: 0.4, z: 0.4 }, { x:  0.5, y: 0.4, z: 0.4 }, // 2, 3: hood top
        { x: -0.4, y: 0.1, z: 0.1 }, { x:  0.4, y: 0.1, z: 0.1 }, // 4, 5: roof front
        { x: -0.4, y: 0.1, z: -0.4 }, { x: 0.4, y: 0.1, z: -0.4 }, // 6, 7: roof back
        { x: -0.6, y: 0.5, z: -0.8 }, { x: 0.6, y: 0.5, z: -0.8 }, // 8, 9: rear bumper
      ];

      const carEdges = [
        [0, 1], [1, 3], [3, 2], [2, 0], // front face
        [2, 4], [3, 5], [4, 5],         // hood to roof
        [4, 6], [5, 7], [6, 7],         // roof
        [6, 8], [7, 9], [8, 9],         // roof to rear
        [0, 8], [1, 9],                 // side bottom lines
      ];

      carEdges.forEach(([i1, i2]) => {
        let r1 = rotateY(carVertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(carVertices[i2], angleY.current);
        const proj2 = project(r2, size);
        allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, type: 'car' });
      });

      // WHEELS (4 simple diamonds)
      const wheels = [
        { x: -0.55, z: 0.5 }, { x: 0.55, z: 0.5 }, // front
        { x: -0.55, z: -0.5 }, { x: 0.55, z: -0.5 } // back
      ];
      wheels.forEach(w => {
        const wv = [
          { x: w.x, y: 0.6, z: w.z + 0.1 }, { x: w.x, y: 0.8, z: w.z },
          { x: w.x, y: 0.6, z: w.z - 0.1 }, { x: w.x, y: 0.4, z: w.z }
        ];
        [ [0,1], [1,2], [2,3], [3,0] ].forEach(([i1, i2]) => {
          let r1 = rotateY(wv[i1], angleY.current);
          const proj1 = project(r1, size);
          let r2 = rotateY(wv[i2], angleY.current);
          const proj2 = project(r2, size);
          allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, type: 'wheel' });
        });
      });

      // DRIVING GRID (Floor)
      const gridCount = 8;
      const gridSpacing = 0.8;
      for (let i = -2; i <= 2; i++) {
        // Vertical lines (moving)
        let r1 = rotateY({ x: i * 0.8, y: 0.8, z: -2 + roadOffset }, angleY.current);
        let r2 = rotateY({ x: i * 0.8, y: 0.8, z: 2 + roadOffset }, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        allLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, type: 'grid' });
      }
      for (let j = -2; j <= 3; j++) {
        // Horizontal lines
        let r1 = rotateY({ x: -1.6, y: 0.8, z: j * gridSpacing - roadOffset }, angleY.current);
        let r2 = rotateY({ x: 1.6, y: 0.8, z: j * gridSpacing - roadOffset }, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        allLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, type: 'grid' });
      }

      allLines.sort((a, b) => a.z - b.z);
      setLines(allLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'car' ? theme.primary : line.type === 'wheel' ? theme.accent : theme.primary} 
          thickness={line.type === 'car' ? 1.5 : 1} 
          opacity={line.type === 'grid' ? 0.2 : 0.6} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME FLYING CAR ---
const WireframeFlyingCar = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hoverAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(hoverAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false })
      ])
    ).start();

    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;
      const hoverY = hoverAnim._value * 0.1;

      const vertices = [
        // SHARP NOSE
        { x: 0, y: 0.45 + hoverY, z: 1.0 }, // 0: tip of nose
        
        // MAIN BODY (Wider at back)
        { x: -0.4, y: 0.35 + hoverY, z: 0.4 }, { x: 0.4, y: 0.35 + hoverY, z: 0.4 }, // 1, 2: front cabin top
        { x: -0.5, y: 0.25 + hoverY, z: -0.6 }, { x: 0.5, y: 0.25 + hoverY, z: -0.6 }, // 3, 4: back cabin top
        { x: -0.5, y: 0.65 + hoverY, z: 0.4 }, { x: 0.5, y: 0.65 + hoverY, z: 0.4 }, // 5, 6: front bottom
        { x: -0.6, y: 0.75 + hoverY, z: -0.8 }, { x: 0.6, y: 0.75 + hoverY, z: -0.8 }, // 7, 8: back bottom
        
        // WINGS (Sleek, angled back)
        { x: -1.3, y: 0.5 + hoverY, z: -0.4 }, { x: 1.3, y: 0.5 + hoverY, z: -0.4 }, // 9, 10: wing tips
        
        // REAR FINS
        { x: -0.4, y: 0.1 + hoverY, z: -0.7 }, { x: 0.4, y: 0.1 + hoverY, z: -0.7 }, // 11, 12: top fins
      ];

      const edges = [
        // Nose to cabin
        [0, 1], [0, 2], [0, 5], [0, 6],
        // Cabin structure
        [1, 2], [2, 4], [4, 3], [3, 1], // top
        [5, 6], [6, 8], [8, 7], [7, 5], // bottom
        [1, 5], [2, 6], [3, 7], [4, 8], // vertical connectors
        // Wings
        [1, 9], [3, 9], [7, 9], [5, 9],
        [2, 10], [4, 10], [8, 10], [6, 10],
        // Fins
        [3, 11], [4, 12]
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.5} opacity={0.6} />
      ))}
    </View>
  );
};

// --- WIREFRAME CYBER SKULL ---
const WireframeCyberSkull = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.008;

      const vertices = [
        // CRANIUM (Top part)
        { x: 0, y: -0.8, z: 0 },      // 0: top center
        { x: 0.5, y: -0.5, z: 0.4 },  // 1: top right front
        { x: -0.5, y: -0.5, z: 0.4 }, // 2: top left front
        { x: 0.5, y: -0.5, z: -0.4 }, // 3: top right back
        { x: -0.5, y: -0.5, z: -0.4 },// 4: top left back
        { x: 0.6, y: 0, z: 0.5 },     // 5: mid right front
        { x: -0.6, y: 0, z: 0.5 },    // 6: mid left front
        { x: 0.6, y: 0, z: -0.5 },    // 7: mid right back
        { x: -0.6, y: 0, z: -0.5 },   // 8: mid left back
        
        // FACE / NOSE AREA
        { x: 0.2, y: 0.2, z: 0.7 },   // 9: right eye socket top
        { x: -0.2, y: 0.2, z: 0.7 },  // 10: left eye socket top
        { x: 0, y: 0.4, z: 0.8 },     // 11: nose bridge
        { x: 0.3, y: 0.5, z: 0.6 },   // 12: right cheekbone
        { x: -0.3, y: 0.5, z: 0.6 },  // 13: left cheekbone
        
        // JAW
        { x: 0.25, y: 0.8, z: 0.4 },  // 14: right jaw bottom
        { x: -0.25, y: 0.8, z: 0.4 }, // 15: left jaw bottom
        { x: 0, y: 0.9, z: 0.5 },     // 16: chin
      ];

      const edges = [
        // Cranium
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 5], [2, 6], [3, 7], [4, 8],
        [5, 6], [7, 8], [5, 7], [6, 8],
        
        // Face
        [5, 9], [6, 10], [9, 11], [10, 11],
        [9, 12], [10, 13], [11, 16], // nose to chin line
        
        // Jaw
        [12, 14], [13, 15], [14, 16], [15, 16],
        [5, 12], [6, 13], // cheekbone connectors
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      // ADD CIRCUIT PATTERN ON FOREHEAD (Dynamic lines)
      for (let i = 0; i < 3; i++) {
        const fy = -0.4 - i * 0.1;
        let r1 = rotateY({ x: -0.3, y: fy, z: 0.55 }, angleY.current);
        let r2 = rotateY({ x: 0.3, y: fy, z: 0.55 }, angleY.current);
        const p1 = project(r1, size);
        const p2 = project(r2, size);
        projectedLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, isCircuit: true });
      }

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.isCircuit ? theme.accent : theme.primary} 
          thickness={line.isCircuit ? 1 : 1.5} 
          opacity={0.6} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME WALKMAN ---
const WireframeWalkman = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const reelAngle = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.008;
      reelAngle.current += 0.05; // Spinning reels

      const allLines = [];

      // MAIN BODY
      const vertices = [
        { x: -0.6, y: -0.8, z: -0.2 }, { x:  0.6, y: -0.8, z: -0.2 }, // 0, 1: top back
        { x:  0.6, y:  0.8, z: -0.2 }, { x: -0.6, y:  0.8, z: -0.2 }, // 2, 3: bottom back
        { x: -0.6, y: -0.8, z:  0.2 }, { x:  0.6, y: -0.8, z:  0.2 }, // 4, 5: top front
        { x:  0.6, y:  0.8, z:  0.2 }, { x: -0.6, y:  0.8, z:  0.2 }, // 6, 7: bottom front
        
        // CASSETTE WINDOW
        { x: -0.4, y: -0.3, z: 0.21 }, { x: 0.4, y: -0.3, z: 0.21 },  // 8, 9: window top
        { x: 0.4, y: 0.3,  z: 0.21 }, { x: -0.4, y: 0.3,  z: 0.21 },  // 10, 11: window bottom
      ];

      const bodyEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back
        [4, 5], [5, 6], [6, 7], [7, 4], // front
        [0, 4], [1, 5], [2, 6], [3, 7], // depth
        [8, 9], [9, 10], [10, 11], [11, 8], // window
      ];

      bodyEdges.forEach(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, type: 'body' });
      });

      // REELS (Two spinning circles inside window)
      const reelCenters = [{ x: -0.2, y: 0 }, { x: 0.2, y: 0 }];
      const reelRadius = 0.1;
      const segments = 6;

      reelCenters.forEach(center => {
        for (let i = 0; i < segments; i++) {
          const t1 = (i * 2 * Math.PI) / segments + reelAngle.current;
          const t2 = ((i + 1) * 2 * Math.PI) / segments + reelAngle.current;
          
          const p1 = { x: center.x + Math.cos(t1) * reelRadius, y: center.y + Math.sin(t1) * reelRadius, z: 0.15 };
          const p2 = { x: center.x + Math.cos(t2) * reelRadius, y: center.y + Math.sin(t2) * reelRadius, z: 0.15 };
          const p3 = { x: center.x, y: center.y, z: 0.15 }; // center point

          let r1 = rotateY(p1, angleY.current);
          let r2 = rotateY(p2, angleY.current);
          let r3 = rotateY(p3, angleY.current);
          
          const proj1 = project(r1, size);
          const proj2 = project(r2, size);
          const proj3 = project(r3, size);

          allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z)/2, type: 'reel' });
          allLines.push({ p1: { x: proj1.x, y: proj1.y }, p2: { x: proj3.x, y: proj3.y }, z: (proj1.z + proj3.z)/2, type: 'reel' });
        }
      });

      // ANTENNA (top left)
      const antBase = { x: -0.4, y: -0.8, z: 0 };
      const antTop = { x: -0.4, y: -1.2, z: 0 };
      let r1 = rotateY(antBase, angleY.current);
      let r2 = rotateY(antTop, angleY.current);
      const p1 = project(r1, size);
      const p2 = project(r2, size);
      allLines.push({ p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, z: (p1.z + p2.z)/2, type: 'body' });

      allLines.sort((a, b) => a.z - b.z);
      setLines(allLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'reel' ? theme.accent : theme.primary} 
          thickness={line.type === 'body' ? 1.5 : 1} 
          opacity={0.6} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME DATA DISK ---
const WireframeDataDisk = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const angleX = useRef(0.6); // Tilted view

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.015;

      const allLines = [];
      const segments = 24;
      const rings = [0.2, 0.5, 0.8, 1.0]; // Concentric rings

      rings.forEach((radius, ringIdx) => {
        for (let i = 0; i < segments; i++) {
          const t1 = (i * 2 * Math.PI) / segments;
          const t2 = ((i + 1) * 2 * Math.PI) / segments;
          
          const p1 = { x: Math.cos(t1) * radius, y: 0, z: Math.sin(t1) * radius };
          const p2 = { x: Math.cos(t2) * radius, y: 0, z: Math.sin(t2) * radius };
          allLines.push({ p1, p2, type: 'ring' });

          // Radial sectors (lines connecting rings)
          if (ringIdx > 0) {
            const pInner = { x: Math.cos(t1) * rings[ringIdx-1], y: 0, z: Math.sin(t1) * rings[ringIdx-1] };
            allLines.push({ p1, p2: pInner, type: 'sector' });
          }
        }
      });

      const projectedLines = allLines.map(line => {
        let r1 = rotateX(line.p1, angleX.current);
        r1 = rotateY(r1, angleY.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(line.p2, angleX.current);
        r2 = rotateY(r2, angleY.current);
        const proj2 = project(r2, size);

        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: (proj1.z + proj2.z) / 2,
          type: line.type
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'ring' ? theme.primary : theme.accent} 
          thickness={line.type === 'ring' ? 1.5 : 1} 
          opacity={line.z > 0 ? 0.6 : 0.2} 
        />
      ))}
    </View>
  );
};

// --- WIREFRAME HYPER CUBE ---
const WireframeHyperCube = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleX = useRef(0);
  const angleY = useRef(0);
  const angleZ = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleX.current += 0.006;
      angleY.current += 0.009;
      angleZ.current += 0.004;

      const vertices = [
        // OUTER CUBE
        { x: -1, y: -1, z: -1 }, { x:  1, y: -1, z: -1 },
        { x:  1, y:  1, z: -1 }, { x: -1, y:  1, z: -1 },
        { x: -1, y: -1, z:  1 }, { x:  1, y: -1, z:  1 },
        { x:  1, y:  1, z:  1 }, { x: -1, y:  1, z:  1 },
        // INNER CUBE
        { x: -0.5, y: -0.5, z: -0.5 }, { x:  0.5, y: -0.5, z: -0.5 },
        { x:  0.5, y:  0.5, z: -0.5 }, { x: -0.5, y:  0.5, z: -0.5 },
        { x: -0.5, y: -0.5, z:  0.5 }, { x:  0.5, y: -0.5, z:  0.5 },
        { x:  0.5, y:  0.5, z:  0.5 }, { x: -0.5, y:  0.5, z:  0.5 },
      ];

      const edges = [
        // Outer Cube
        [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
        // Inner Cube
        [8, 9], [9, 10], [10, 11], [11, 8], [12, 13], [13, 14], [14, 15], [15, 12], [8, 12], [9, 13], [10, 14], [11, 15],
        // Connections
        [0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateX(vertices[i1], angleX.current);
        r1 = rotateY(r1, angleY.current);
        r1 = rotateZ(r1, angleZ.current);
        const proj1 = project(r1, size);

        let r2 = rotateX(vertices[i2], angleX.current);
        r2 = rotateY(r2, angleY.current);
        r2 = rotateZ(r2, angleZ.current);
        const proj2 = project(r2, size);

        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2, isInner: i1 >= 8 && i2 >= 8, isConnector: i1 < 8 && i2 >= 8 };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.isConnector ? theme.accent : theme.primary} 
          thickness={line.isInner ? 1 : 1.5} 
          opacity={0.6} 
        />
      ))}
    </View>
  );
};

// --- WARP SPEED ---
const WarpSpeed = ({ theme }) => {
  const [stars, setStars] = useState([]);
  
  const createStar = () => ({
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 20,
    z: Math.random() * 10 + 2,
    sz: Math.random() * 2 + 1,
  });

  const initialStars = useMemo(() => Array.from({ length: 50 }).map(createStar), []);

  useEffect(() => {
    let currentStars = [...initialStars];
    let animationFrame;

    const animate = () => {
      currentStars = currentStars.map(s => {
        let newZ = s.z - 0.15; // Move towards screen
        if (newZ <= 0.1) return createStar(); // Reset star to far distance
        return { ...s, z: newZ };
      });

      const projectedStars = currentStars.map(s => {
        const proj = project({ x: s.x, y: s.y, z: s.z }, 100);
        const opacity = Math.min(1, (10 - s.z) / 5);
        return { ...proj, size: s.sz * (10 / s.z), opacity };
      });

      setStars(projectedStars);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: s.x,
          top: s.y,
          width: s.size,
          height: s.size,
          borderRadius: s.size / 2,
          backgroundColor: i % 3 === 0 ? theme.accent : theme.primary,
          opacity: s.opacity,
        }} />
      ))}
    </View>
  );
};

// --- WIREFRAME CYBER OBELISK ---
const WireframeCyberObelisk = ({ theme, size = 120 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const vertices = [
        { x: -0.6, y:  0.6, z: -0.6 }, { x:  0.6, y:  0.6, z: -0.6 }, // 0, 1: bottom back
        { x:  0.6, y:  0.6, z:  0.6 }, { x: -0.6, y:  0.6, z:  0.6 }, // 2, 3: bottom front
        { x:  0,   y: -0.8, z:  0 },                                // 4: top tip
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // base
        [0, 4], [1, 4], [2, 4], [3, 4], // sides to tip
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
        const proj2 = project(r2, size);
        return { p1: { x: proj1.x, y: proj1.y }, p2: { x: proj2.x, y: proj2.y }, z: (proj1.z + proj2.z) / 2 };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.5} opacity={0.6} />
      ))}
    </View>
  );
};

// --- WIREFRAME CYBER TORUS ---
const WireframeCyberTorus = ({ theme, size = 100 }) => {
  const [lines, setLines] = useState([]);
  const angleY = useRef(0);
  const angleX = useRef(0.5);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.01;

      const allLines = [];
      const majorSegments = 16;
      const minorSegments = 8;
      const R = 1.0; // major radius
      const r = 0.4; // minor radius

      for (let i = 0; i < majorSegments; i++) {
        const u1 = (i * 2 * Math.PI) / majorSegments;
        const u2 = ((i + 1) * 2 * Math.PI) / majorSegments;

        for (let j = 0; j < minorSegments; j++) {
          const v1 = (j * 2 * Math.PI) / minorSegments;
          const v2 = ((j + 1) * 2 * Math.PI) / minorSegments;

          const p1 = {
            x: (R + r * Math.cos(v1)) * Math.cos(u1),
            y: r * Math.sin(v1),
            z: (R + r * Math.cos(v1)) * Math.sin(u1)
          };
          const p2 = {
            x: (R + r * Math.cos(v1)) * Math.cos(u2),
            y: r * Math.sin(v1),
            z: (R + r * Math.cos(v1)) * Math.sin(u2)
          };
          const p3 = {
            x: (R + r * Math.cos(v2)) * Math.cos(u1),
            y: r * Math.sin(v2),
            z: (R + r * Math.cos(v2)) * Math.sin(u1)
          };

          allLines.push({ p1, p2, type: 'major' });
          allLines.push({ p1, p2: p3, type: 'minor' });
        }
      }

      const projectedLines = allLines.map(line => {
        let rotated = rotateX(line.p1, angleX.current);
        rotated = rotateY(rotated, angleY.current);
        const proj1 = project(rotated, size);

        let rotated2 = rotateX(line.p2, angleX.current);
        rotated2 = rotateY(rotated2, angleY.current);
        const proj2 = project(rotated2, size);

        return { 
          p1: { x: proj1.x, y: proj1.y }, 
          p2: { x: proj2.x, y: proj2.y }, 
          z: (rotated.z + rotated2.z) / 2,
          type: line.type
        };
      });

      projectedLines.sort((a, b) => a.z - b.z);
      setLines(projectedLines);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [size, theme]);

  return (
    <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          p1={line.p1} 
          p2={line.p2} 
          color={line.type === 'major' ? theme.primary : theme.accent} 
          thickness={1} 
          opacity={line.z > 0 ? 0.5 : 0.15} 
        />
      ))}
    </View>
  );
};

const AmbientBackground = () => {
  const { theme, bgEffect } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bgEffect === 'nebula') {
      Animated.loop(
        Animated.timing(animValue, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else if (bgEffect === 'aurora') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 10000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration: 10000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else if (bgEffect === 'scanline') {
      Animated.loop(
        Animated.timing(animValue, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else if (bgEffect === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      animValue.setValue(0);
    }
  }, [bgEffect]);

  if (bgEffect === 'none') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg }]} pointerEvents="none" />;
  }

  const renderEffect = () => {
    switch (bgEffect) {
      case 'nebula':
        const spin = animValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        return (
          <Animated.View style={{ position: 'absolute', top: -width/2, left: -width/2, width: width * 2, height: width * 2, opacity: 0.15, transform: [{ rotate: spin }] }}>
            <LinearGradient colors={[theme.primary, 'transparent', theme.bg]} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          </Animated.View>
        );

      case 'gridSphere':
        return (
          <View style={{ flex: 1 }}>
             <WireframeSphere theme={theme} size={140} />
          </View>
        );

      case 'cube':
        return (
          <View style={{ flex: 1 }}>
             <WireframeCube theme={theme} size={80} />
          </View>
        );
      
      case 'dna':
        return (
          <View style={{ flex: 1 }}>
             <WireframeDNA theme={theme} size={100} />
          </View>
        );

      case 'retroPC':
        return (
          <View style={{ flex: 1 }}>
             <WireframeRetroPC theme={theme} size={110} />
          </View>
        );

      case 'keypadPhone':
        return (
          <View style={{ flex: 1 }}>
             <WireframeKeypadPhone theme={theme} size={130} />
          </View>
        );

      case 'wireframeHouse':
        return (
          <View style={{ flex: 1 }}>
             <WireframeHouse theme={theme} size={120} />
          </View>
        );

      case 'typewriter':
        return (
          <View style={{ flex: 1 }}>
             <WireframeTypewriter theme={theme} size={110} />
          </View>
        );

      case 'roseInPot':
        return (
          <View style={{ flex: 1 }}>
             <WireframeRoseInPot theme={theme} size={130} />
          </View>
        );

      case 'gramophone':
        return (
          <View style={{ flex: 1 }}>
             <WireframeGramophone theme={theme} size={110} />
          </View>
        );

      case 'sea':
        return (
          <View style={{ flex: 1 }}>
             <WireframeSea theme={theme} size={150} />
          </View>
        );

      case 'cyberCity':
        return (
          <View style={{ flex: 1 }}>
             <WireframeCyberCity theme={theme} size={100} />
          </View>
        );

      case 'saturn':
        return (
          <View style={{ flex: 1 }}>
             <WireframeSaturn theme={theme} size={80} />
          </View>
        );

      case 'flyingCar':
        return (
          <View style={{ flex: 1 }}>
             <WireframeFlyingCar theme={theme} size={110} />
          </View>
        );

      case 'cyberSkull':
        return (
          <View style={{ flex: 1 }}>
             <WireframeCyberSkull theme={theme} size={120} />
          </View>
        );

      case 'walkman':
        return (
          <View style={{ flex: 1 }}>
             <WireframeWalkman theme={theme} size={130} />
          </View>
        );

      case 'dataDisk':
        return (
          <View style={{ flex: 1 }}>
             <WireframeDataDisk theme={theme} size={140} />
          </View>
        );

      case 'hyperCube':
        return (
          <View style={{ flex: 1 }}>
             <WireframeHyperCube theme={theme} size={100} />
          </View>
        );

      case 'warpSpeed':
        return <WarpSpeed theme={theme} />;

      case 'cyberObelisk':
        return (
          <View style={{ flex: 1 }}>
             <WireframeCyberObelisk theme={theme} size={130} />
          </View>
        );

      case 'cyberTorus':
        return (
          <View style={{ flex: 1 }}>
             <WireframeCyberTorus theme={theme} size={100} />
          </View>
        );

      case 'particles':
        return <Particles theme={theme} />;
      
      case 'matrixRain':
        return <MatrixRain theme={theme} />;

      case 'aiHead':
        return (
          <View style={{ flex: 1 }}>
             <AIHead theme={theme} size={90} />
          </View>
        );

      case 'aurora':
        const translateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [-50, 50] });
        return (
          <Animated.View style={{ position: 'absolute', width: width, height: height * 1.5, opacity: 0.2, transform: [{ translateY }] }}>
            <LinearGradient colors={[theme.bg, theme.primary, theme.accent, theme.bg]} locations={[0, 0.4, 0.6, 1]} style={{ flex: 1 }} />
          </Animated.View>
        );

      case 'grid':
        return (
          <View style={{ flex: 1, opacity: 0.1 }}>
             {Array.from({ length: 20 }).map((_, i) => <View key={`h-${i}`} style={{ position: 'absolute', top: i * 40, width: '100%', height: 1, backgroundColor: theme.primary }} />)}
             {Array.from({ length: 10 }).map((_, i) => <View key={`v-${i}`} style={{ position: 'absolute', left: i * 40, height: '100%', width: 1, backgroundColor: theme.primary }} />)}
             <LinearGradient colors={[theme.bg, 'transparent', theme.bg]} style={StyleSheet.absoluteFill} />
          </View>
        );

      case 'scanline':
        const scanY = animValue.interpolate({ inputRange: [0, 1], outputRange: [-100, height + 100] });
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, opacity: 0.1, backgroundColor: theme.primary, transform: [{ translateY: scanY }] }}>
              <LinearGradient colors={['transparent', theme.primary, 'transparent']} style={{ flex: 1 }} />
            </Animated.View>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.bg, opacity: 0.05 }} />
          </View>
        );

      case 'pulse':
        const pulseScale = animValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.3, 0.8] });
        const pulseOpacity = animValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.3, 0.1] });
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={{ width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, backgroundColor: theme.primary, opacity: pulseOpacity, transform: [{ scale: pulseScale }] }} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        {renderEffect()}
      </View>
    </View>
  );
};

export default AmbientBackground;