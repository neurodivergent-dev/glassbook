import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const PALETTES = {
  default: {
    id: 'default',
    name: 'Cyberpunk',
    primary: '#5E6AD2',
    accent: '#A78BFA',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    primary: '#F700FF',
    accent: '#00FFFF',
  },
  plasma: {
    id: 'plasma',
    name: 'Plasma',
    primary: '#9D00FF',
    accent: '#FF0055',
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    primary: '#CCFF00',
    accent: '#00FF66',
  },
  glitch: {
    id: 'glitch',
    name: 'Glitch',
    primary: '#00FFFF',
    accent: '#FF0000',
  },
  retro: {
    id: 'retro',
    name: 'Retro',
    primary: '#FF9900',
    accent: '#FF00CC',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    primary: '#00FF41',
    accent: '#008F11',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    primary: '#FF2D55',
    accent: '#FF9F0A',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primary: '#2AC9DE',
    accent: '#5856D6',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    primary: '#FFD700',
    accent: '#FFA500',
  }
};

const BASE_THEMES = {
  dark: {
    mode: 'dark',
    bg: '#0F0F11',
    card: 'rgba(30, 30, 35, 0.40)', // More transparent
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    text: '#FFFFFF',
    textSec: '#8E8E93',
    danger: '#FF453A',
    success: '#32D74B',
    warning: '#FFD60A',
    tabBg: 'rgba(28, 28, 30, 0.85)',
    statusBarStyle: 'light-content',
    modalBg: '#151517',
    inputPlaceholder: '#555',
    pillBorder: '#333',
  },
  light: {
    mode: 'light',
    bg: '#F2F2F7',
    card: 'rgba(255, 255, 255, 0.40)', // More transparent
    cardBorder: 'rgba(255, 255, 255, 0.5)',
    text: '#1C1C1E',
    textSec: '#8E8E93',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    tabBg: 'rgba(255, 255, 255, 0.85)',
    statusBarStyle: 'dark-content',
    modalBg: '#FFFFFF',
    inputPlaceholder: '#C7C7CC',
    pillBorder: '#E5E5EA',
  }
};

const STORAGE_KEY_MODE = '@app_theme_mode';
const STORAGE_KEY_PALETTE = '@app_theme_palette';
const STORAGE_KEY_BG_EFFECT = '@app_theme_bg_effect';
const STORAGE_KEY_HAPTICS = '@app_theme_haptics';

export const BACKGROUND_EFFECTS = {
  nebula: { id: 'nebula', name: 'Nebula', icon: 'planet' },
  aurora: { id: 'aurora', name: 'Aurora', icon: 'water' },
  aiHead: { id: 'aiHead', name: 'AI Core', icon: 'hardware-chip' },
  grid: { id: 'grid', name: 'Grid', icon: 'grid' },
  gridSphere: { id: 'gridSphere', name: 'Küre', icon: 'globe' },
  cube: { id: 'cube', name: 'Küp', icon: 'cube' },
  scanline: { id: 'scanline', name: 'Scanline', icon: 'pulse' },
  pulse: { id: 'pulse', name: 'Pulse', icon: 'radio-button-on' },
  particles: { id: 'particles', name: 'Parçacıklar', icon: 'snow' },
  matrixRain: { id: 'matrixRain', name: 'Matrix', icon: 'code-download' },
  dna: { id: 'dna', name: 'DNA', icon: 'infinite' },
  retroPC: { id: 'retroPC', name: 'Eski PC', icon: 'desktop' },
  none: { id: 'none', name: 'Kapalı', icon: 'close-circle' },
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');
  const [activePalette, setActivePalette] = useState('default');
  const [bgEffect, setBgEffect] = useState('nebula');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Merge Base Theme + Active Palette
  const theme = {
    ...BASE_THEMES[themeMode],
    ...PALETTES[activePalette],
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
      const storedPalette = await AsyncStorage.getItem(STORAGE_KEY_PALETTE);
      const storedBgEffect = await AsyncStorage.getItem(STORAGE_KEY_BG_EFFECT);
      const storedHaptics = await AsyncStorage.getItem(STORAGE_KEY_HAPTICS);
      
      if (storedMode) setThemeMode(storedMode);
      if (storedPalette && PALETTES[storedPalette]) setActivePalette(storedPalette);
      if (storedBgEffect && BACKGROUND_EFFECTS[storedBgEffect]) setBgEffect(storedBgEffect);
      if (storedHaptics !== null) setHapticsEnabled(JSON.parse(storedHaptics));
    } catch (e) {
      console.log('Failed to load theme settings', e);
    }
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    await AsyncStorage.setItem(STORAGE_KEY_MODE, newMode);
  };

  const toggleHaptics = async () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_HAPTICS, JSON.stringify(newValue));
  };

  const setPalette = async (paletteId) => {
    if (PALETTES[paletteId]) {
      setActivePalette(paletteId);
      await AsyncStorage.setItem(STORAGE_KEY_PALETTE, paletteId);
    }
  };

  const setBackgroundEffect = async (effectId) => {
    if (BACKGROUND_EFFECTS[effectId]) {
      setBgEffect(effectId);
      await AsyncStorage.setItem(STORAGE_KEY_BG_EFFECT, effectId);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      themeMode, 
      setPalette, 
      activePalette, 
      palettes: PALETTES,
      bgEffect,
      setBgEffect: setBackgroundEffect,
      backgroundEffects: BACKGROUND_EFFECTS,
      hapticsEnabled,
      toggleHaptics
    }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);