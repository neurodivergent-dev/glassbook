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
const STORAGE_KEY_AMBIENT_SOUND = '@app_theme_ambient_sound_id';
const STORAGE_KEY_AMBIENT_ENABLED = '@app_theme_ambient_enabled';
const STORAGE_KEY_CRT_FILTER = '@app_theme_crt_filter';
const STORAGE_KEY_TERMINAL_MODE = '@app_theme_terminal_mode';
const STORAGE_KEY_GEMINI_API_KEY = '@app_theme_gemini_api_key';
const STORAGE_KEY_PROCEDURAL_AUDIO = '@app_theme_procedural_audio';
const STORAGE_KEY_SYNTH_MUSIC = '@app_theme_synth_music';
const STORAGE_KEY_SYNTH_KB = '@app_theme_synth_kb';
const STORAGE_KEY_SYNTH_MOOD = '@app_theme_synth_mood';
const STORAGE_KEY_TTS_ENABLED = '@app_theme_tts_enabled';

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
  keypadPhone: { id: 'keypadPhone', name: 'Antika Tel', icon: 'phone-portrait' },
  wireframeHouse: { id: 'wireframeHouse', name: 'Bacalı Ev', icon: 'home' },
  typewriter: { id: 'typewriter', name: 'Daktilo', icon: 'print' },
  roseInPot: { id: 'roseInPot', name: 'Saksıda Gül', icon: 'flower' },
  gramophone: { id: 'gramophone', name: 'Gramafon', icon: 'musical-notes' },
  sea: { id: 'sea', name: 'Deniz', icon: 'water' },
  cyberCity: { id: 'cyberCity', name: 'Siber Şehir', icon: 'business' },
  saturn: { id: 'saturn', name: 'Satürn', icon: 'planet' },
  flyingCar: { id: 'flyingCar', name: 'Uçan Araba', icon: 'car-sport' },
  cyberSkull: { id: 'cyberSkull', name: 'Siber Kurukafa', icon: 'skull' },
  walkman: { id: 'walkman', name: 'Walkman', icon: 'headset' },
  dataDisk: { id: 'dataDisk', name: 'Veri Diski', icon: 'disc' },
  hyperCube: { id: 'hyperCube', name: 'Hiper Küp', icon: 'cube-outline' },
  warpSpeed: { id: 'warpSpeed', name: 'Warp Speed', icon: 'rocket' },
  cyberObelisk: { id: 'cyberObelisk', name: 'Siber Piramit', icon: 'triangle' },
  cyberTorus: { id: 'cyberTorus', name: 'Siber Torus', icon: 'radio-button-off' },
  none: { id: 'none', name: 'Kapalı', icon: 'close-circle' },
};

export const AMBIENT_SOUNDS = {
  rain: { id: 'rain', name: 'Yağmur', icon: 'cloudy-night', url: 'https://www.soundjay.com/nature_c2026/sounds/rain-01.mp3' },
  neon: { id: 'neon', name: 'Neon Hum', icon: 'flashlight', url: 'https://orangefreesounds.com/wp-content/uploads/2025/07/Neon-light-buzzing-sound-effect.mp3' },
  lofi: { id: 'lofi', name: 'Lo-Fi Beat', icon: 'musical-note', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  wind: { id: 'wind', name: 'Rüzgar', icon: 'leaf', url: 'https://www.soundjay.com/nature_c2026/sounds/wind-1.mp3' },
  keyboard: { id: 'keyboard', name: 'Klavye', icon: 'keypad', url: 'https://www.orangefreesounds.com/wp-content/uploads/2016/09/Typing-sound-effect-keyboard.mp3' },
};

export const SYNTH_MOODS = {
  cyberbeat: { id: 'cyberbeat', name: 'Cyberbeat', icon: 'musical-notes' },
  neonDream: { id: 'neonDream', name: 'Neon Dream', icon: 'color-wand' },
  soulLink: { id: 'soulLink', name: 'Soul Link', icon: 'heart' },
  cyberPiano: { id: 'cyberPiano', name: 'Cyber Piano', icon: 'musical-note' },
  velvetSoft: { id: 'velvetSoft', name: 'Velvet Soft', icon: 'leaf' },
  ambient: { id: 'ambient', name: 'Ambient', icon: 'cloudy-night' },
  hacker: { id: 'hacker', name: 'Hacker Arp', icon: 'terminal' },
  glitch: { id: 'glitch', name: 'Glitch Noir', icon: 'pulse' },
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');
  const [activePalette, setActivePalette] = useState('default');
  const [bgEffect, setBgEffect] = useState('nebula');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [ambientSoundId, setAmbientSoundId] = useState('rain');
  const [isAmbientEnabled, setIsAmbientEnabled] = useState(false);
  const [crtFilterEnabled, setCrtFilterEnabled] = useState(false);
  const [terminalModeEnabled, setTerminalModeEnabled] = useState(false);
  const [blackwallEnabled, setBlackwallEnabled] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [proceduralAudioEnabled, setProceduralAudioEnabled] = useState(false);
  const [synthMusicEnabled, setSynthMusicEnabled] = useState(true);
  const [synthKeyboardEnabled, setSynthKeyboardEnabled] = useState(true);
  const [synthUnlocked, setSynthUnlocked] = useState(false);
  const [synthMood, setSynthMood] = useState('cyberbeat');
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Merge Base Theme + Active Palette
  const theme = {
    ...BASE_THEMES[themeMode],
    ...(blackwallEnabled ? { primary: '#FF0000', accent: '#8B0000', text: '#FF4444' } : PALETTES[activePalette]),
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
      const storedAmbientId = await AsyncStorage.getItem(STORAGE_KEY_AMBIENT_SOUND);
      const storedAmbientEnabled = await AsyncStorage.getItem(STORAGE_KEY_AMBIENT_ENABLED);
      const storedCrtFilter = await AsyncStorage.getItem(STORAGE_KEY_CRT_FILTER);
      const storedTerminal = await AsyncStorage.getItem(STORAGE_KEY_TERMINAL_MODE);
      const storedApiKey = await AsyncStorage.getItem(STORAGE_KEY_GEMINI_API_KEY);
      const storedProcedural = await AsyncStorage.getItem(STORAGE_KEY_PROCEDURAL_AUDIO);
      const storedSynthMusic = await AsyncStorage.getItem(STORAGE_KEY_SYNTH_MUSIC);
      const storedSynthKb = await AsyncStorage.getItem(STORAGE_KEY_SYNTH_KB);
      const storedSynthMood = await AsyncStorage.getItem(STORAGE_KEY_SYNTH_MOOD);
      const storedTts = await AsyncStorage.getItem(STORAGE_KEY_TTS_ENABLED);
      
      if (storedMode) setThemeMode(storedMode);
      if (storedPalette && PALETTES[storedPalette]) setActivePalette(storedPalette);
      if (storedBgEffect && BACKGROUND_EFFECTS[storedBgEffect]) setBgEffect(storedBgEffect);
      if (storedHaptics !== null) setHapticsEnabled(JSON.parse(storedHaptics));
      if (storedAmbientId && AMBIENT_SOUNDS[storedAmbientId]) setAmbientSoundId(storedAmbientId);
      if (storedAmbientEnabled !== null) setIsAmbientEnabled(JSON.parse(storedAmbientEnabled));
      if (storedCrtFilter !== null) setCrtFilterEnabled(JSON.parse(storedCrtFilter));
      if (storedTerminal !== null) setTerminalModeEnabled(JSON.parse(storedTerminal));
      if (storedApiKey) setGeminiApiKey(storedApiKey);
      if (storedProcedural !== null) setProceduralAudioEnabled(JSON.parse(storedProcedural));
      if (storedSynthMusic !== null) setSynthMusicEnabled(JSON.parse(storedSynthMusic));
      if (storedSynthKb !== null) setSynthKeyboardEnabled(JSON.parse(storedSynthKb));
      if (storedSynthMood && SYNTH_MOODS[storedSynthMood]) setSynthMood(storedSynthMood);
      if (storedTts !== null) setTtsEnabled(JSON.parse(storedTts));
    } catch (e) {
      console.log('Failed to load theme settings', e);
    }
  };

  const toggleTts = async () => {
    const newValue = !ttsEnabled;
    setTtsEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_TTS_ENABLED, JSON.stringify(newValue));
  };

  const setSynthMoodWithStorage = async (moodId) => {
    if (SYNTH_MOODS[moodId]) {
      setSynthMood(moodId);
      await AsyncStorage.setItem(STORAGE_KEY_SYNTH_MOOD, moodId);
    }
  };

  const toggleProceduralAudio = async () => {
    const newValue = !proceduralAudioEnabled;
    setProceduralAudioEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_PROCEDURAL_AUDIO, JSON.stringify(newValue));
  };

  const toggleSynthMusic = async () => {
    const newValue = !synthMusicEnabled;
    setSynthMusicEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_SYNTH_MUSIC, JSON.stringify(newValue));
  };

  const toggleSynthKeyboard = async () => {
    const newValue = !synthKeyboardEnabled;
    setSynthKeyboardEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_SYNTH_KB, JSON.stringify(newValue));
  };

  const saveApiKey = async (key) => {
    setGeminiApiKey(key);
    await AsyncStorage.setItem(STORAGE_KEY_GEMINI_API_KEY, key);
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

  const toggleAmbient = async () => {
    const newValue = !isAmbientEnabled;
    setIsAmbientEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_AMBIENT_ENABLED, JSON.stringify(newValue));
  };

  const toggleCrtFilter = async () => {
    const newValue = !crtFilterEnabled;
    setCrtFilterEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_CRT_FILTER, JSON.stringify(newValue));
  };

  const toggleTerminalMode = async () => {
    const newValue = !terminalModeEnabled;
    setTerminalModeEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY_TERMINAL_MODE, JSON.stringify(newValue));
  };

  const setAmbientSound = async (soundId) => {
    if (AMBIENT_SOUNDS[soundId]) {
      setAmbientSoundId(soundId);
      await AsyncStorage.setItem(STORAGE_KEY_AMBIENT_SOUND, soundId);
    }
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
      toggleHaptics,
      ambientSoundId,
      setAmbientSound,
      isAmbientEnabled,
      toggleAmbient,
      ambientSounds: AMBIENT_SOUNDS,
      crtFilterEnabled,
      toggleCrtFilter,
      terminalModeEnabled,
      toggleTerminalMode,
      blackwallEnabled,
      setBlackwallEnabled,
      geminiApiKey,
      saveApiKey,
      proceduralAudioEnabled,
      toggleProceduralAudio,
      synthMusicEnabled,
      toggleSynthMusic,
      synthKeyboardEnabled,
      toggleSynthKeyboard,
      synthUnlocked,
      setSynthUnlocked,
      synthMood,
      setSynthMood: setSynthMoodWithStorage,
      synthMoods: SYNTH_MOODS,
      ttsEnabled,
      toggleTts
    }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bg} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);