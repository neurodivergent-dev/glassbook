import React, { useRef, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, Dimensions, Animated, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'Tümü', color: 'transparent' },
  { id: 'work', name: 'İş', color: '#5E6AD2' },
  { id: 'personal', name: 'Kişisel', color: '#FF453A' },
  { id: 'ideas', name: 'Fikirler', color: '#FFD60A' },
  { id: 'todo', name: 'Yapılacaklar', color: '#32D74B' },
];

const NoteCard = ({ item, onPress, index }) => {
  const { theme, themeMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const categoryColor = CATEGORIES.find(c => c.id === item.category)?.color || theme.primary;

  return (
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.cardWrapper}
      >
        <View style={[styles.card, { borderColor: theme.cardBorder }]}>
          <View style={[StyleSheet.absoluteFill, { 
            backgroundColor: themeMode === 'dark' 
              ? 'rgba(30, 30, 35, 0.5)' 
              : 'rgba(255, 255, 255, 0.4)',
            borderRadius: 24,
          }]} />
          
          <View style={styles.contentContainer}>
            <View style={[styles.cornerMarker, { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderColor: categoryColor + '60' }]} />
            <View style={[styles.cornerMarker, { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderColor: categoryColor + '60' }]} />
            <View style={[styles.cornerMarker, { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: categoryColor + '60' }]} />
            <View style={[styles.cornerMarker, { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderColor: categoryColor + '60' }]} />
  
            <View style={[styles.leftAccent, { backgroundColor: categoryColor }]} />
  
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {!!item.isPinned && <Ionicons name="pin" size={12} color={theme.warning} style={{ marginRight: 5 }} />}
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              </View>
              <View style={[styles.dot, { backgroundColor: categoryColor }]} />
            </View>
  
            <Text style={[styles.cardPreview, { color: theme.textSec }, !!item.isLocked && { opacity: 0.3, letterSpacing: 3 }]} numberOfLines={5}>
              {!!item.isLocked ? '••••••••••••••••' : item.content}
            </Text>
  
            <View style={styles.cardFooter}>
              <Text style={[styles.cardDate, { color: theme.textSec + '80' }]}>{item.date}</Text>
              {!!item.isLocked && <Ionicons name="lock-closed" size={10} color={theme.textSec} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  card: {
    height: 210,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        backgroundColor: 'transparent',
      },
      android: {
      }
    })
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cornerMarker: {
    position: 'absolute',
    width: 10,
    height: 10,
    opacity: 0.8,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardPreview: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardDate: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default NoteCard;
