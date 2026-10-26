import React from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { id: 'all', name: 'Tümü', color: 'transparent' },
  { id: 'work', name: 'İş', color: '#5E6AD2' },
  { id: 'personal', name: 'Kişisel', color: '#FF453A' },
  { id: 'ideas', name: 'Fikirler', color: '#FFD60A' },
  { id: 'todo', name: 'Yapılacaklar', color: '#32D74B' },
];

export const SearchBar = ({ value, onChange }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}>
      <Ionicons name="search" size={20} color={theme.textSec} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Notlarda ara..."
        placeholderTextColor={theme.textSec}
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={20} color={theme.textSec} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const CategoryPills = ({ selected, onSelect }) => {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 15 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const isActive = selected === item.id;
          return (
            <TouchableOpacity 
              style={[ 
                styles.pill, 
                { borderColor: theme.pillBorder },
                isActive && { backgroundColor: theme.card, borderColor: item.color === 'transparent' ? theme.text : item.color } 
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(item.id);
              }}
            >
              {item.color !== 'transparent' && <View style={[styles.dot, { backgroundColor: item.color, marginRight: 6 }]} />}
              <Text style={[styles.pillText, { color: isActive ? theme.text : theme.textSec }]}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});