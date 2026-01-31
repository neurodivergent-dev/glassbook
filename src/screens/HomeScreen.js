import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/AmbientBackground';
import NoteCard from '../components/NoteCard';
import { SearchBar, CategoryPills } from '../components/UIComponents';
import NoteEditorModal from '../components/NoteEditorModal';
import EmptyState from '../components/EmptyState';

const HomeScreen = () => {
  const { notes, saveNote, deleteNote } = useNotes();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Editor State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const insets = useSafeAreaInsets();

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (selectedCategory !== 'all') {
      result = result.filter(n => n.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return parseInt(b.id) - parseInt(a.id); 
      }
      return a.isPinned ? -1 : 1;
    });
  }, [notes, selectedCategory, searchQuery]);

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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notlar</Text>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={[theme.primary, theme.accent]} style={StyleSheet.absoluteFill} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>P</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH & FILTER */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* LIST */}
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <NoteCard item={item} index={index} onPress={() => openNote(item)} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListEmptyComponent={
            <EmptyState 
              icon="planet-outline" 
              message={searchQuery ? "Sonuç bulunamadı" : "Burası çok sessiz..."}
              subMessage={searchQuery ? "Farklı bir şeyler aramayı dene." : "İlk notunu oluşturarak bu boşluğu doldur."}
            />
          }
        />
      </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { 
          bottom: 135, 
          shadowColor: theme.primary,
          shadowOpacity: 0.6,
          shadowRadius: 15,
        }]} 
        activeOpacity={0.8}
        onPress={() => openNote(null)}
      >
        <LinearGradient
          colors={[theme.primary, theme.accent]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
        />
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  profileBtn: {
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden'
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default HomeScreen;