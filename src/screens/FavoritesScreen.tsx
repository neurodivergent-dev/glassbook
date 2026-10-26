import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/AmbientBackground';
import NoteCard from '../components/NoteCard';
import NoteEditorModal from '../components/NoteEditorModal';
import EmptyState from '../components/EmptyState';

const FavoritesScreen = () => {
  const { notes, saveNote, deleteNote } = useNotes();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const pinnedNotes = useMemo(() => {
    return notes.filter(n => n.isPinned).sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [notes]);

  const openNote = (note) => {
    Haptics.selectionAsync();
    setSelectedNote(note);
    setModalVisible(true);
  };

  const handleSave = (note) => {
    saveNote(note);
  };

  const handleDelete = (id) => {
    deleteNote(id);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={theme.statusBarStyle} />
      <AmbientBackground />
      
      <SafeAreaView style={{ flex: 1, paddingBottom: 80 }} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Favoriler</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={pinnedNotes}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <NoteCard item={item} index={index} onPress={() => openNote(item)} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListEmptyComponent={
            <EmptyState 
              icon="heart-dislike-outline" 
              message="Favori listen boş"
              subMessage="Önemli notlarını iğneleyerek buraya ekleyebilirsin."
            />
          }
        />
      </SafeAreaView>

      <NoteEditorModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
});

export default FavoritesScreen;