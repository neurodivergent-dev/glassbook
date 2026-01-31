import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import AmbientBackground from '../components/AmbientBackground';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, value, label, theme }) => (
  <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <View style={[styles.statIcon, { backgroundColor: theme.bg }]}>
      <Ionicons name={icon} size={24} color={theme.primary} />
    </View>
    <View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSec }]}>{label}</Text>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { notes } = useNotes();

  const stats = useMemo(() => {
    const total = notes.length;
    const pinned = notes.filter(n => n.isPinned).length;
    const words = notes.reduce((acc, curr) => acc + (curr.content?.split(' ').length || 0), 0);
    return { total, pinned, words };
  }, [notes]);

  // Gamification Logic
  const level = Math.floor(Math.sqrt(stats.total)) + 1;
  const nextLevelNoteCount = Math.pow(level, 2);
  const currentLevelNoteCount = Math.pow(level - 1, 2);
  const progress = Math.min(
    1,
    (stats.total - currentLevelNoteCount) / (nextLevelNoteCount - currentLevelNoteCount)
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profil</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[theme.primary, theme.accent]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>P</Text>
              </LinearGradient>
              <View style={[styles.onlineBadge, { backgroundColor: theme.success, borderColor: theme.bg }]} />
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>Glass User</Text>
            <Text style={[styles.userHandle, { color: theme.textSec }]}>@glass_master</Text>
          </View>

          {/* Level Progress */}
          <View style={[styles.levelContainer, { backgroundColor: theme.card }]}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelText, { color: theme.primary }]}>Level {level}</Text>
              <Text style={[styles.xpText, { color: theme.textSec }]}>
                {stats.total} / {nextLevelNoteCount} NOT
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.bg }]}>
              <LinearGradient
                colors={[theme.primary, theme.accent]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={[styles.levelDesc, { color: theme.textSec }]}>
              Sonraki seviyeye ulaşmak için {nextLevelNoteCount - stats.total} not daha oluştur.
            </Text>
          </View>

          {/* Stats Grid */}
          <Text style={[styles.sectionTitle, { color: theme.textSec }]}>İSTATİSTİKLER</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="documents-outline" value={stats.total} label="Toplam Not" theme={theme} />
            <StatCard icon="pin-outline" value={stats.pinned} label="İğnelenen" theme={theme} />
            <StatCard icon="text-outline" value={stats.words} label="Kelime" theme={theme} />
            <StatCard icon="flame-outline" value={level} label="Seviye" theme={theme} />
          </View>

          {/* Badges / Achievements Placeholder */}
          <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 20 }]}>ROZETLER</Text>
          <View style={[styles.badgesContainer, { backgroundColor: theme.card }]}>
             <View style={styles.badgeItem}>
                <Ionicons name="trophy" size={32} color={theme.warning} />
                <Text style={[styles.badgeText, { color: theme.textSec }]}>Erken Erişim</Text>
             </View>
             <View style={[styles.badgeItem, { opacity: 0.3 }]}>
                <Ionicons name="rocket" size={32} color={theme.textSec} />
                <Text style={[styles.badgeText, { color: theme.textSec }]}>Power User</Text>
             </View>
             <View style={[styles.badgeItem, { opacity: 0.3 }]}>
                <Ionicons name="book" size={32} color={theme.textSec} />
                <Text style={[styles.badgeText, { color: theme.textSec }]}>Yazar</Text>
             </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 50,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 14,
  },
  levelContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 28,
    fontWeight: '800',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
  },
  levelDesc: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 15,
    marginLeft: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    marginTop: 8,
  }
});

export default ProfileScreen;
