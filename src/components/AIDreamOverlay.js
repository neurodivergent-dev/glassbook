import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';

const { width, height } = Dimensions.get('window');

// Random helper
const random = (min, max) => Math.random() * (max - min) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Glitch Character Generator
const glitchChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|!@#$%^&*()_+=- ";
const getGlitchChar = () => glitchChars[Math.floor(Math.random() * glitchChars.length)];

// A single floating "Thought" component
const DreamThought = ({ word, theme, index }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState("");
  
  // Random properties for this thought
  const startX = useMemo(() => random(20, width - 100), []);
  const startY = useMemo(() => random(50, height - 100), []);
  const fontSize = useMemo(() => random(12, 24), []);
  const duration = useMemo(() => random(4000, 8000), []);
  const delay = useMemo(() => random(0, 2000), []);

  useEffect(() => {
    // 1. Fade In & Move Up
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: 1,
        duration: duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start();

    // 2. Glitch Text Effect
    let iter = 0;
    const interval = setInterval(() => {
      if (iter > 10) { // After 10 frames, show real word
        setDisplayText(word);
        clearInterval(interval);
      } else {
        // Show mix of word and random chars
        let glitched = "";
        for (let i = 0; i < word.length; i++) {
          if (Math.random() > 0.5) glitched += word[i];
          else glitched += getGlitchChar();
        }
        setDisplayText(glitched);
      }
      iter++;
    }, 100);

    return () => clearInterval(interval);
  }, [word]);

  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0]
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100] // Float up
  });

  return (
    <Animated.View style={[styles.thought, { 
      left: startX, 
      top: startY, 
      opacity,
      transform: [{ translateY }] 
    }]}>
      <Text style={[styles.thoughtText, { color: theme.primary, fontSize, fontFamily: 'monospace' }]}>
        {displayText}
      </Text>
      <Text style={[styles.thoughtHex, { color: theme.accent }]}>
        {`0x${(index * 1234).toString(16).toUpperCase()}`}
      </Text>
    </Animated.View>
  );
};

const AIDreamOverlay = () => {
  const { theme, isDreaming, registerInteraction } = useTheme();
  const { notes } = useNotes();
  const [thoughts, setThoughts] = useState([]);
  
  // Extract keywords from notes
  const keywords = useMemo(() => {
    if (notes.length === 0) return ["SYSTEM", "IDLE", "DREAM", "WAITING", "NO DATA"];
    
    const words = [];
    notes.forEach(n => {
      // Split title and content by spaces
      const raw = (n.title + " " + n.content).split(/\s+/);
      raw.forEach(w => {
        if (w.length > 3) words.push(w.toUpperCase());
      });
    });
    // Remove duplicates and limit pool
    return [...new Set(words)].slice(0, 50); 
  }, [notes]);

  useEffect(() => {
    if (!isDreaming) {
      setThoughts([]);
      return;
    }

    // Spawn thoughts periodically
    const interval = setInterval(() => {
      const newWord = randomChoice(keywords);
      const id = Date.now();
      setThoughts(prev => [...prev.slice(-15), { id, word: newWord }]); // Keep max 15 on screen
    }, 800);

    return () => clearInterval(interval);
  }, [isDreaming, keywords]);

  if (!isDreaming) return null;

  return (
    <TouchableWithoutFeedback onPress={registerInteraction}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999 }]}>
        {/* Background Grid */}
        <View style={StyleSheet.absoluteFill}>
          {Array.from({ length: 20 }).map((_, i) => (
             <View key={i} style={{ 
               position: 'absolute', 
               top: i * (height / 20), 
               width: '100%', 
               height: 1, 
               backgroundColor: theme.primary, 
               opacity: 0.05 
             }} />
          ))}
        </View>

        {/* Floating Thoughts */}
        {thoughts.map((t, i) => (
          <DreamThought key={t.id} word={t.word} theme={theme} index={i} />
        ))}

        {/* Status Line */}
        <View style={{ position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: theme.textSec, fontSize: 10, letterSpacing: 2 }}>
            SYSTEM HIBERNATION /// PROCESSING MEMORIES
          </Text>
          <Text style={{ color: theme.textSec, fontSize: 10, marginTop: 5 }}>
            [TOUCH TO WAKE]
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  thought: {
    position: 'absolute',
    alignItems: 'center',
  },
  thoughtText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  thoughtHex: {
    fontSize: 8,
    opacity: 0.7,
    marginTop: -2,
  }
});

export default AIDreamOverlay;
