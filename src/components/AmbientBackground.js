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
      ];

      const projectedLines = edges.map(([i1, i2]) => {
        let r1 = rotateY(vertices[i1], angleY.current);
        const proj1 = project(r1, size);
        let r2 = rotateY(vertices[i2], angleY.current);
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
        <Line key={i} p1={line.p1} p2={line.p2} color={theme.primary} thickness={1.5} opacity={0.6} />
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