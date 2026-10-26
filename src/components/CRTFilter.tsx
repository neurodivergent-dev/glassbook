import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const CRTFilter = () => {
  const { crtFilterEnabled, blackwallEnabled, theme } = useTheme();
  const scanlineAnim = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (crtFilterEnabled || blackwallEnabled) {
      // Moving scanline animation
      Animated.loop(
        Animated.timing(scanlineAnim, {
          toValue: 1,
          duration: blackwallEnabled ? 1000 : 4000, // Faster in blackwall
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Subtle flicker animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: blackwallEnabled ? 0.5 : 0.8, duration: 100, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: blackwallEnabled ? 0.6 : 0.9, duration: 30, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [crtFilterEnabled, blackwallEnabled]);

  if (!crtFilterEnabled && !blackwallEnabled) return null;

  const translateY = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, height],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Static Scanline Grid - Reduced opacity */}
      <View style={[styles.scanlineGrid, { opacity: blackwallEnabled ? 0.3 : 0.08 }]}>
        {Array.from({ length: Math.floor(height / (blackwallEnabled ? 3 : 6)) }).map((_, i) => (
          <View key={i} style={[styles.singleScanline, blackwallEnabled && { backgroundColor: '#FF0000' }]} />
        ))}
      </View>

      {/* Moving Highlight Bar - Reduced opacity */}
      <Animated.View style={[styles.movingBar, { transform: [{ translateY }], opacity: blackwallEnabled ? 0.6 : 0.3 }]}>
        <LinearGradient
          colors={['transparent', blackwallEnabled ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.02)', 'transparent']}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Subtle Flicker Overlay - Extremely reduced opacity */}
      <Animated.View style={[styles.flickerOverlay, { 
        backgroundColor: blackwallEnabled ? '#FF0000' : '#fff',
        opacity: flickerAnim.interpolate({
          inputRange: [0.5, 1],
          outputRange: [blackwallEnabled ? 0.15 : 0.005, 0]
        }) 
      }]} />

      {/* Screen Vignette - Slightly more transparent */}
      <LinearGradient
        colors={[blackwallEnabled ? 'rgba(50,0,0,0.6)' : 'rgba(0,0,0,0.2)', 'transparent', 'transparent', blackwallEnabled ? 'rgba(50,0,0,0.6)' : 'rgba(0,0,0,0.2)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  scanlineGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  singleScanline: {
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    marginBottom: 3,
  },
  movingBar: {
    position: 'absolute',
    width: '100%',
    height: 100,
    zIndex: 2,
  },
  flickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  }
});

export default CRTFilter;
