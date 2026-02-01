import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotesProvider } from './src/context/NotesContext';
import AppNavigator from './src/navigation/AppNavigator';
import AmbientSoundPlayer from './src/components/AmbientSoundPlayer';
import CRTFilter from './src/components/CRTFilter';
import CyberSynth from './src/components/CyberSynth';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AmbientSoundPlayer />
        <CRTFilter />
        <NotesProvider>
          <AppNavigator />
          {/* CyberSynth burada global olarak yaşıyor, böylece müzik hiç kesilmez */}
          <CyberSynth />
        </NotesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}