import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';

const { width, height } = Dimensions.get('window');

// --- 3D MATH HELPERS ---
const rotateX = (point, theta) => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: point.x, y: point.y * cos - point.z * sin, z: point.y * sin + point.z * cos };
};
const rotateY = (point, theta) => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: point.x * cos + point.z * sin, y: point.y, z: -point.x * sin + point.z * cos };
};
const project = (point, size) => {
  const fov = 400;
  const distance = 2.5;
  const scale = fov / (fov + point.z + distance);
  return {
    x: point.x * scale * size + width / 2,
    y: point.y * scale * size + height / 3,
    z: point.z
  };
};

const Line = ({ p1, p2, color, thickness = 1, opacity = 0.2 }) => {
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

const CATEGORY_COORDS = {
  work: { x: 0.7, y: -0.2, z: 0 },
  personal: { x: -0.5, y: 0.5, z: 0.5 },
  ideas: { x: 0, y: -0.8, z: 0.3 },
  todo: { x: -0.2, y: 0.1, z: -0.9 },
  all: { x: 0, y: 0, z: 1 }
};

const NetMap3D = ({ activeCategory, onCategoryPress }) => {
  const { theme } = useTheme();
  const { notes } = useNotes();
  const [lines, setLines] = useState([]);
  const [nodes, setNodes] = useState([]);
  const angleY = useRef(0);

  const sphereLines = useMemo(() => {
    const l = [];
    const segments = 12;
    const rings = 6;
    for (let i = 0; i <= rings; i++) {
      const phi = (Math.PI * i) / rings;
      for (let j = 0; j < segments; j++) {
        const theta1 = (2 * Math.PI * j) / segments;
        const theta2 = ((j + 1) * 2 * Math.PI) / segments;
        l.push({
          p1: { x: Math.sin(phi) * Math.cos(theta1), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta1) },
          p2: { x: Math.sin(phi) * Math.cos(theta2), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta2) }
        });
      }
    }
    return l;
  }, []);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      angleY.current += 0.005;
      const size = 160;

      const projectedLines = sphereLines.map(line => {
        const r1 = rotateY(line.p1, angleY.current);
        const r2 = rotateY(line.p2, angleY.current);
        return { p1: project(r1, size), p2: project(r2, size), z: (r1.z + r2.z) / 2 };
      });

      const projectedNodes = Object.keys(CATEGORY_COORDS).map(catId => {
        const rotated = rotateY(CATEGORY_COORDS[catId], angleY.current);
        const proj = project(rotated, size);
        const count = notes.filter(n => catId === 'all' ? true : n.category === catId).length;
        return { ...proj, id: catId, count, z: rotated.z };
      });

      setLines(projectedLines);
      setNodes(projectedNodes);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [notes]);

  return (
    <View style={styles.container}>
      {lines.map((l, i) => (
        <Line key={i} p1={l.p1} p2={l.p2} color={theme.primary} opacity={l.z > 0 ? 0.2 : 0.05} />
      ))}

      {nodes.map((node) => {
        // If node has items (count > 0), never hide it (force visibility)
        const isAlwaysVisible = node.count > 0;
        const isVisible = isAlwaysVisible || node.z > -0.5;

        return isVisible && (
          <TouchableOpacity 
            key={node.id} 
            onPress={() => onCategoryPress(node.id)}
            style={[styles.node, { 
              left: node.x - 12, 
              top: node.y - 12,
              backgroundColor: node.id === activeCategory ? theme.accent : 'rgba(0,0,0,0.6)',
              borderColor: theme.primary,
              // Reduced opacity for back nodes instead of hiding
              opacity: node.z > 0 ? 1 : (isAlwaysVisible ? 0.5 : 0.2),
              transform: [{ scale: node.z > 0 ? 1.2 : 0.8 }]
            }]}
          >
            <Text style={[styles.nodeText, { color: theme.text }]}>{node.count}</Text>
            <View style={styles.labelContainer}>
              <Text style={[styles.nodeLabel, { color: theme.text }]}>{node.id.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  node: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  nodeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  labelContainer: {
    position: 'absolute',
    top: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  nodeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  }
});

export default NetMap3D;
