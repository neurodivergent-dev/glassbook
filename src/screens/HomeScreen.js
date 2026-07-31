import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
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
import TerminalScreen from './TerminalScreen';

const HomeScreen = () => {
  const { notes, saveNote, deleteNote } = useNotes();
  const { theme, terminalModeEnabled, isPreviewMode, togglePreviewMode } = useTheme();
  const navigation = useNavigation();
  
  if (terminalModeEnabled) {
    return <TerminalScreen />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fade animation for preview mode
  const fadeAnim = useRef(new Animated.Value(isPreviewMode ? 0 : 1)).current;
  
  // Editor State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isPreviewMode ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isPreviewMode]);

  const handleTogglePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    togglePreviewMode();
  };

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
          <Animated.Text style={[styles.headerTitle, { color: theme.text, opacity: fadeAnim }]}>Notlar</Animated.Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity 
                style={[styles.profileBtn, { marginRight: 12 }]}
                onPress={handleTogglePreview}
                activeOpacity={0.7}
                disabled={isPreviewMode}
              >
                <LinearGradient colors={[theme.primary, theme.accent]} style={StyleSheet.absoluteFill} />
                <Ionicons name="eye" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity 
                style={styles.profileBtn}
                onPress={() => !isPreviewMode && navigation.navigate('Profile')}
                disabled={isPreviewMode}
              >
                <LinearGradient colors={[theme.primary, theme.accent]} style={StyleSheet.absoluteFill} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>P</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }} pointerEvents={isPreviewMode ? 'none' : 'auto'}>
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
        </Animated.View>
      </SafeAreaView>

      {/* FULL SCREEN BACK TAP (Only when previewing) */}
      {isPreviewMode && (
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={handleTogglePreview}
          activeOpacity={1}
        />
      )}

      {/* FAB */}
      <Animated.View 
        style={{ 
          position: 'absolute',
          right: 20,
          bottom: 135,
          opacity: fadeAnim,
          transform: [{
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1]
            })
          }]
        }}
        pointerEvents={isPreviewMode ? 'none' : 'auto'}
      >
        <TouchableOpacity 
          style={[styles.fab, { 
            shadowColor: theme.primary,
            shadowOpacity: 0.6,
            shadowRadius: 15,
          }]} 
          activeOpacity={0.8}
          onPress={() => !isPreviewMode && openNote(null)}
          disabled={isPreviewMode}
        >
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
          />
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

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