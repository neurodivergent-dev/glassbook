import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/AmbientBackground';
import NoteCard from '../components/NoteCard';
import NoteEditorModal from '../components/NoteEditorModal';
import EmptyState from '../components/EmptyState';

const FavoritesScreen = () => {
  const { notes, saveNote, deleteNote } = useNotes();
  const { theme } = useTheme();

  // Editor State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const pinnedNotes = notes.filter(n => n.isPinned);

  const openNote = (note) => {
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
          contentContainerStyle={[
            styles.listContent,
            pinnedNotes.length === 0 && styles.emptyListContent
          ]}
          numColumns={2}
          columnWrapperStyle={pinnedNotes.length > 0 ? { justifyContent: 'space-between' } : undefined}
          ListEmptyComponent={
            <EmptyState 
              icon="bookmark-outline" 
              message="Henüz favori not yok"
              subMessage="Önemli notlarınızı sabitleyerek bu alandan hızlıca erişebilirsiniz."
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
});

export default FavoritesScreen;
