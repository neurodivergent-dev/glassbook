import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message?: string;
  subMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = "document-text-outline", 
  message = "Henüz bir not yok", 
  subMessage = "Eklediğiniz notlar burada listelenir." 
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Ionicons name={icon} size={28} color={theme.textSec} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{message}</Text>
      {subMessage ? (
        <Text style={[styles.subtitle, { color: theme.textSec }]}>{subMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 240,
  },
});

export default EmptyState;
