import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Share, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { id: 'all', name: 'Tümü', color: 'transparent' },
  { id: 'work', name: 'İş', color: '#5E6AD2' },
  { id: 'personal', name: 'Kişisel', color: '#FF453A' },
  { id: 'ideas', name: 'Fikirler', color: '#FFD60A' },
  { id: 'todo', name: 'Yapılacaklar', color: '#32D74B' },
];

const NoteEditorModal = ({ visible, onClose, note, onSave, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('work');
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category || 'work');
      setIsPinned(note.isPinned || false);
      setIsLocked(note.isLocked || false);
      setIsReadingMode(true);
    } else {
      setTitle('');
      setContent('');
      setCategory('work');
      setIsPinned(false);
      setIsLocked(false);
      setIsReadingMode(false);
    }
  }, [note, visible]);

  const handleClose = () => {
    if (!isReadingMode && (title.trim().length > 0 || content.trim().length > 0)) {
      Alert.alert(
        "Kaydedilmemiş Değişiklikler",
        "Çıkarsanız değişiklikleriniz kaybolacak.",
        [
          { text: "Vazgeç", style: "cancel" },
          { text: "Çık", style: "destructive", onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onSave({
      id: note ? note.id : Date.now().toString(),
      title: title || 'Başlıksız',
      content,
      category,
      isPinned,
      isLocked,
      date: new Date().toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    });
    onClose();
  };

  const shareNote = async () => {
    try {
      await Share.share({ message: `${title}\n\n${content}` });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.modalBg, { backgroundColor: theme.modalBg }]}
      >
        <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.modalBtnText, { color: theme.text }]}>{isReadingMode ? 'Kapat' : 'İptal'}</Text>
          </TouchableOpacity>
          
          <View style={styles.modalActions}>
            {note && (
              <TouchableOpacity onPress={() => setIsReadingMode(!isReadingMode)} style={styles.iconBtn}>
                <Ionicons name={isReadingMode ? "create-outline" : "eye-outline"} size={22} color={theme.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={shareNote} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
            
            {!isReadingMode && (
              <>
                <TouchableOpacity onPress={() => setIsPinned(!isPinned)} style={styles.iconBtn}>
                  <Ionicons name={isPinned ? "pin" : "pin-outline"} size={22} color={isPinned ? theme.warning : theme.textSec} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsLocked(!isLocked)} style={styles.iconBtn}>
                  <Ionicons name={isLocked ? "lock-closed" : "lock-open-outline"} size={22} color={isLocked ? theme.danger : theme.textSec} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={[styles.modalBtnText, { color: theme.primary, fontWeight: 'bold', marginLeft: 10 }]}>Kaydet</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.editorContainer}>
          {isReadingMode ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.readTitle, { color: theme.text }]}>{title}</Text>
              <View style={styles.readMetaRow}>
                 <View style={[styles.miniPill, { backgroundColor: CATEGORIES.find(c => c.id === category)?.color + '30', borderColor: 'transparent' }]}>
                    <View style={[styles.dot, { backgroundColor: CATEGORIES.find(c => c.id === category)?.color, marginRight: 5 }]} />
                    <Text style={{ color: CATEGORIES.find(c => c.id === category)?.color, fontSize: 12 }}>
                      {CATEGORIES.find(c => c.id === category)?.name}
                    </Text>
                 </View>
                 <Text style={{ color: theme.textSec, fontSize: 12, marginLeft: 10 }}>
                   {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </Text>
              </View>
              <Text style={[styles.readContent, { color: theme.text }]}>{content}</Text>
            </ScrollView>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <TextInput
                  style={[styles.inputTitle, { color: theme.text }]}
                  placeholder="Başlık"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={title}
                  onChangeText={setTitle}
                />
                
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                   {CATEGORIES.slice(1).map(cat => (
                     <TouchableOpacity 
                        key={cat.id} 
                        onPress={() => setCategory(cat.id)}
                        style={[styles.miniPill, { borderColor: theme.pillBorder }, category === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
                     >
                       <View style={[styles.dot, { backgroundColor: cat.color, marginRight: 5 }]} />
                       <Text style={{ color: category === cat.id ? cat.color : theme.textSec, fontSize: 12 }}>{cat.name}</Text>
                     </TouchableOpacity>
                   ))}
                </View>

                <TextInput
                  style={[styles.inputContent, { color: theme.text }]}
                  placeholder="Fikirlerini yaz..."
                  placeholderTextColor={theme.inputPlaceholder}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false} // Let the outer ScrollView handle scrolling
                />
              </ScrollView>

              <View style={[styles.statsBar, { borderTopColor: theme.cardBorder }]}>
                <Text style={[styles.statsText, { color: theme.textSec }]}>
                  {content.length} karakter | {content.split(' ').filter(w => w).length} kelime
                </Text>
                {note && onDelete && (
                  <TouchableOpacity onPress={() => onDelete(note.id)}>
                     <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 20, borderBottomWidth: 1 },
  modalActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginLeft: 5 },
  modalBtnText: { fontSize: 16 },
  editorContainer: { flex: 1, padding: 20 },
  inputTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  inputContent: { fontSize: 17, lineHeight: 26, flex: 1 },
  miniPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  statsText: { fontSize: 11 },
  readTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, lineHeight: 34 },
  readMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  readContent: { fontSize: 18, lineHeight: 30, paddingBottom: 40 }
});

export default NoteEditorModal;