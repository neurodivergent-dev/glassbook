import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import NetMap3D from '../components/NetMap3D';
import AmbientBackground from '../components/AmbientBackground';
import NoteCard from '../components/NoteCard';
import NoteEditorModal from '../components/NoteEditorModal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const NetMapScreen = () => {
  const { theme } = useTheme();
  const { notes, saveNote, deleteNote } = useNotes();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  
  // Editor State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const filteredNotes = notes.filter(n => 
    selectedCategory === 'all' ? true : n.category === selectedCategory
  );

  const openNote = (note) => {
    Haptics.selectionAsync();
    setSelectedNote(note);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1, paddingBottom: 130 }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Global Net Map</Text>
          <Text style={{ color: theme.textSec, fontSize: 12 }}>NEURAL_LINK_ESTABLISHED // SCANNING NODES...</Text>
        </View>

        <View style={styles.mapContainer}>
          <NetMap3D activeCategory={selectedCategory} onCategoryPress={(cat) => {
            setSelectedCategory(cat);
            setIsPanelVisible(true);
          }} />
        </View>

        <View style={[styles.detailsPanel, !isPanelVisible && { height: 60 }]}>
          <LinearGradient
            colors={[theme.card, 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity 
            style={styles.panelHeader} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPanelVisible(!isPanelVisible);
            }}
          >
            <View>
              <Text style={[styles.panelTitle, { color: theme.primary }]}>
                {selectedCategory.toUpperCase()} NODE_DATA
              </Text>
              {isPanelVisible && (
                <Text style={{ color: theme.textSec, fontSize: 10 }}>
                  {filteredNotes.length} FRAGMENTS DETECTED
                </Text>
              )}
            </View>
            <Ionicons 
              name={isPanelVisible ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={theme.primary} 
            />
          </TouchableOpacity>

          {isPanelVisible && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 15 }}
            >
              {filteredNotes.map((note, index) => (
                <View key={note.id} style={{ marginRight: 15 }}>
                  <NoteCard item={note} index={index} onPress={() => openNote(note)} />
                </View>
              ))}
              {filteredNotes.length === 0 && (
                <Text style={{ color: theme.textSec, marginTop: 20, fontStyle: 'italic' }}>
                  No data fragments found in this sector.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      <NoteEditorModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
        onSave={saveNote}
        onDelete={deleteNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  mapContainer: {
    flex: 1,
    height: 300,
  },
  detailsPanel: {
    height: 320,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panelHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});

export default NetMapScreen;
