import React, { useRef } from 'react';
import { View, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AIDreamOverlay from './AIDreamOverlay';

const DreamWrapper = ({ children }) => {
  const { registerInteraction } = useTheme();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true, // Capture even if child handles it? No, false.
      // Actually, we want to detect ANY touch, but not block it.
      // So we use onMoveShouldSetPanResponderCapture: () => false
      // and onStartShouldSetPanResponderCapture: () => false
      // Wait, easiest way is to wrap everything in a View with onTouchStart
      
      onPanResponderGrant: () => {
        registerInteraction();
      },
      onPanResponderMove: () => {
        registerInteraction();
      },
      onStartShouldSetPanResponderCapture: () => {
        registerInteraction(); // Update timer on any touch start
        return false; // Don't steal the touch from buttons
      }
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
      <AIDreamOverlay />
    </View>
  );
};

export default DreamWrapper;