import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotesProvider } from './src/context/NotesContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotesProvider>
          <AppNavigator />
        </NotesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
