import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { useTheme } from './ThemeContext';

const NotesContext = createContext();

const STORAGE_KEY = '@premium_notes_v3';

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const { hapticsEnabled } = useTheme();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) setNotes(JSON.parse(s));
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const saveNote = async (note) => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const updated = notes.some(n => n.id === note.id)
      ? notes.map(n => n.id === note.id ? note : n)
      : [note, ...notes];
      
    setNotes(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteNote = (id) => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert("Sil", "Bu notu silmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }}
    ]);
  };

  return (
    <NotesContext.Provider value={{ notes, saveNote, deleteNote, refreshNotes: load }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
