import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';

const CyberSynth = () => {
  const { 
    proceduralAudioEnabled, synthUnlocked, setSynthUnlocked, 
    synthMood, synthKeyboardEnabled, synthMusicEnabled, ttsEnabled 
  } = useTheme();
  const webViewRef = useRef(null);

  // Mood ve Kontrolleri WebView'a Enjekte Et
  useEffect(() => {
    if (webViewRef.current && synthUnlocked) {
      const js = `
        window.currentMood = '${synthMood}';
        window.musicEnabled = ${synthMusicEnabled};
        window.keyboardEnabled = ${synthKeyboardEnabled};
        if(window.updateMood) window.updateMood('${synthMood}');
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [synthMood, synthMusicEnabled, synthKeyboardEnabled, synthUnlocked]);

  // Terminal SFX ve TTS
  useEffect(() => {
    const subType = DeviceEventEmitter.addListener('TYPE_SOUND', () => {
      if (synthUnlocked && proceduralAudioEnabled && synthKeyboardEnabled) {
        webViewRef.current?.injectJavaScript("if(window.playTypeSound) window.playTypeSound();");
      }
    });
    
    const subSpeak = DeviceEventEmitter.addListener('SPEAK', (text) => {
      if (ttsEnabled && proceduralAudioEnabled) {
        Speech.stop();
        Speech.speak(text, { language: 'en-US', pitch: 0.6, rate: 0.9, volume: 1.0 });
      }
    });

    return () => {
      subType.remove();
      subSpeak.remove();
      Speech.stop();
    };
  }, [synthUnlocked, proceduralAudioEnabled, synthKeyboardEnabled, ttsEnabled]);

  const synthCode = useMemo(() => `
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let ctx = null;
    let nextNoteTime = 0;
    let noteIdx = 0;
    let schedulerID = null;
    let masterGain = null;
    
    window.currentMood = '${synthMood}';
    window.musicEnabled = ${synthMusicEnabled};
    window.keyboardEnabled = ${synthKeyboardEnabled};

    const SCALE = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23]; 
    const BASS_SCALE = [36.71, 43.65, 49.00, 55.00];

    function initAudio() {
      if (ctx) return;
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
    }

    window.updateMood = function(mood) {
      window.currentMood = mood;
      if (ctx) { nextNoteTime = ctx.currentTime + 0.05; noteIdx = 0; }
    };

    window.playTypeSound = function() {
      if(!ctx || !window.keyboardEnabled) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(1200 + Math.random()*400, ctx.currentTime);
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.03);
    };

    function playSynth(f, d, t, type='triangle', vol=0.1) {
      if (!window.musicEnabled) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + d);
    }

    function scheduler() {
      while (nextNoteTime < ctx.currentTime + 0.1) {
        const mood = window.currentMood;
        if (mood === 'cyberbeat') {
          if (noteIdx % 8 === 0) playKick(nextNoteTime, 1.0);
          if (noteIdx % 4 === 0) playSynth(BASS_SCALE[Math.floor(noteIdx/8)%4], 0.4, nextNoteTime, 'sawtooth', 0.2);
          if (Math.random() > 0.6) playSynth(SCALE[Math.floor(Math.random()*SCALE.length)]*2, 0.3, nextNoteTime, 'triangle', 0.05);
          nextNoteTime += 0.15;
        } 
        else if (mood === 'neonDream') {
          if (noteIdx % 4 === 0) playSynth(BASS_SCALE[Math.floor(noteIdx/16)%4], 0.8, nextNoteTime, 'triangle', 0.15);
          const melody = [SCALE[0], SCALE[2], SCALE[4], SCALE[3]];
          if (noteIdx % 4 === 2) playSynth(melody[Math.floor(noteIdx/4)%4] * 2, 0.6, nextNoteTime, 'sine', 0.06);
          nextNoteTime += 0.2;
        }
        else if (mood === 'soulLink') {
          playSynth(SCALE[noteIdx % SCALE.length], 4.0, nextNoteTime, 'sine', 0.06);
          nextNoteTime += 0.35;
        }
        else if (mood === 'cyberPiano') {
          if (noteIdx % 4 === 0) playSynth(SCALE[noteIdx%SCALE.length], 2.0, nextNoteTime, 'triangle', 0.12);
          nextNoteTime += 0.25;
        }
        else if (mood === 'ambient') {
          if (noteIdx % 16 === 0) playSynth(SCALE[Math.floor(Math.random()*SCALE.length)], 10, nextNoteTime, 'sine', 0.05);
          nextNoteTime += 0.5;
        } 
        else if (mood === 'hacker') {
          playSynth(SCALE[noteIdx % SCALE.length] * 3, 0.05, nextNoteTime, 'square', 0.04);
          nextNoteTime += 0.08;
        } 
        else {
          if (Math.random() > 0.7) playSynth(Math.random()*5000 + 100, 0.02, nextNoteTime, 'square', 0.1);
          nextNoteTime += 0.12;
        }
        noteIdx = (noteIdx + 1) % 64;
      }
      schedulerID = setTimeout(scheduler, 25);
    }

    function playKick(t, vol=0.8) {
      if (!window.musicEnabled) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(masterGain);
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(0.01, t + 0.4);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      o.start(t); o.stop(t + 0.4);
    }

    window.initNeuralLink = function() {
      initAudio();
      if (ctx.state === 'suspended') ctx.resume();
      nextNoteTime = ctx.currentTime + 0.1;
      scheduler();
      window.ReactNativeWebView.postMessage('UNLOCKED');
    };
  `, []);

  if (!proceduralAudioEnabled) return null;

  return (
    <View style={synthUnlocked ? styles.offScreen : styles.visible}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: `
          <html><body style="margin:0; padding:0; background:transparent; display:flex; align-items:center; justify-content:center; width:100vw; height:100vh;">
            <button onclick="window.initNeuralLink()" style="width:90%; height:60px; background:rgba(0,255,255,0.1); border:2px solid #0ff; color:#0ff; font-family:monospace; font-weight:bold; font-size:16px; border-radius:12px; box-shadow: 0 0 15px #0ff; outline: none;">
              [ ESTABLISH NEURAL LINK ]
            </button>
            <script>${synthCode}</script>
          </body></html>
        ` }}
        javaScriptEnabled={true}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'UNLOCKED') setSynthUnlocked(true);
        }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  visible: {
    height: 90, marginHorizontal: 15, marginTop: 10, marginBottom: 10,
  },
  offScreen: {
    position: 'absolute',
    top: 0, right: 0,
    width: 1, height: 1,
    opacity: 0.01,
  }
});

export default CyberSynth;