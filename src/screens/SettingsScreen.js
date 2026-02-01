import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackground from '../components/AmbientBackground';
import CyberSynth from '../components/CyberSynth';
import { useTheme } from '../context/ThemeContext';

const SettingsItem = ({ icon, label, value, onValueChange, type = 'switch', theme }) => (
  <View style={[styles.itemContainer, { borderBottomColor: theme.cardBorder }]}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
    </View>
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.cardBorder, true: theme.primary }}
        thumbColor={'#fff'}
        ios_backgroundColor={theme.cardBorder}
      />
    )}
  </View>
);

const ColorSwatch = ({ palette, isActive, onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={styles.swatchContainer}>
    <View style={[
      styles.swatch, 
      { backgroundColor: palette.primary, borderColor: isActive ? theme.text : 'transparent' },
      isActive && styles.activeSwatch
    ]}>
      {isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
    </View>
    <Text style={[styles.swatchLabel, { color: isActive ? theme.primary : theme.textSec }]}>
      {palette.name}
    </Text>
  </TouchableOpacity>
);

const BgEffectOption = ({ effect, isActive, onPress, theme }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[
      styles.effectOption, 
      { 
        borderColor: isActive ? theme.primary : theme.cardBorder, 
        backgroundColor: theme.card 
      }
    ]}
  >
    <Ionicons name={effect.icon} size={24} color={isActive ? theme.primary : theme.textSec} />
    <Text style={[styles.effectLabel, { color: isActive ? theme.primary : theme.textSec, marginTop: 4 }]}>
      {effect.name}
    </Text>
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const { 
    theme, toggleTheme, themeMode, 
    setPalette, activePalette, palettes, 
    bgEffect, setBgEffect, backgroundEffects,
    hapticsEnabled, toggleHaptics,
    ambientSoundId, setAmbientSound, isAmbientEnabled, toggleAmbient, ambientSounds,
    crtFilterEnabled, toggleCrtFilter,
    terminalModeEnabled, toggleTerminalMode,
    geminiApiKey, saveApiKey,
    proceduralAudioEnabled, toggleProceduralAudio, synthUnlocked, synthMood, setSynthMood, synthMoods,
    synthMusicEnabled, toggleSynthMusic, synthKeyboardEnabled, toggleSynthKeyboard,
    ttsEnabled, toggleTts
  } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ayarlar</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* TERMINAL MODE AI */}
          <Text style={[styles.sectionTitle, { color: theme.textSec }]}>TERMINAL AI (GEMINI)</Text>
          <View style={[styles.section, { backgroundColor: theme.card, padding: 15 }]}>
            <Text style={{ color: theme.textSec, fontSize: 12, marginBottom: 10 }}>
              2077 Gemini etkileşimi için bir API anahtarı girin.
            </Text>
            <TextInput
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)', 
                color: theme.primary, 
                padding: 12, 
                borderRadius: 8,
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                fontSize: 12
              }}
              placeholder="API Key buraya..."
              placeholderTextColor={theme.textSec + '50'}
              value={geminiApiKey}
              onChangeText={saveApiKey}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          {/* THEME COLOR ENGINE */}
          <Text style={[styles.sectionTitle, { color: theme.textSec }]}>TEMA RENGİ</Text>
          <View style={[styles.section, { backgroundColor: theme.card, paddingVertical: 15 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {Object.values(palettes).map((p) => (
                <ColorSwatch 
                  key={p.id} 
                  palette={p} 
                  isActive={activePalette === p.id} 
                  onPress={() => setPalette(p.id)}
                  theme={theme}
                />
              ))}
            </ScrollView>
          </View>

          {/* PROCEDURAL AUDIO MOODS */}
          {proceduralAudioEnabled && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 15 }]}>MÜZİK MODU (SYNTH)</Text>
              <View style={[styles.section, { backgroundColor: theme.card, paddingVertical: 15 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                  {Object.values(synthMoods).map((m) => (
                    <TouchableOpacity 
                      key={m.id} 
                      onPress={() => setSynthMood(m.id)}
                      style={[
                        styles.effectOption, 
                        { 
                          borderColor: synthMood === m.id ? theme.primary : theme.cardBorder, 
                          backgroundColor: theme.bg,
                          width: 100,
                          height: 60
                        }
                      ]}
                    >
                      <Ionicons name={m.icon} size={20} color={synthMood === m.id ? theme.primary : theme.textSec} />
                      <Text style={[styles.effectLabel, { color: synthMood === m.id ? theme.primary : theme.textSec }]}>{m.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* AMBIENT_SOUNDS */}
          <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 15 }]}>AMBİYANS SESLERİ</Text>
          <View style={[styles.section, { backgroundColor: theme.card, paddingVertical: 10 }]}>
            <SettingsItem
              theme={theme}
              icon="volume-high"
              label="Ambiyans Sesi"
              value={isAmbientEnabled}
              onValueChange={toggleAmbient}
            />
            {isAmbientEnabled ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
              >
                {Object.values(ambientSounds).map((s) => (
                  <TouchableOpacity 
                    key={s.id} 
                    onPress={() => setAmbientSound(s.id)}
                    style={[
                      styles.effectOption, 
                      { 
                        borderColor: ambientSoundId === s.id ? theme.primary : theme.cardBorder, 
                        backgroundColor: theme.bg,
                        width: 90,
                        height: 60
                      }
                    ]}
                  >
                    <Ionicons name={s.icon} size={20} color={ambientSoundId === s.id ? theme.primary : theme.textSec} />
                    <Text style={[styles.effectLabel, { color: ambientSoundId === s.id ? theme.primary : theme.textSec }]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </View>

          {/* BACKGROUND EFFECT */}
          <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 15 }]}>ARKAPLAN EFEKTİ</Text>
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
              {Object.values(backgroundEffects).map((effect) => (
                <BgEffectOption 
                  key={effect.id} 
                  effect={effect} 
                  isActive={bgEffect === effect.id} 
                  onPress={() => setBgEffect(effect.id)}
                  theme={theme}
                />
              ))}
            </ScrollView>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 15 }]}>GÖRÜNÜM VE DENEYİM</Text>
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <SettingsItem
              theme={theme}
              icon={themeMode === 'dark' ? "moon" : "sunny"}
              label="Karanlık Mod"
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
            />
            <SettingsItem
              theme={theme}
              icon="musical-notes-outline"
              label="Prosedürel Ses (Synth Master)"
              value={proceduralAudioEnabled}
              onValueChange={toggleProceduralAudio}
            />
            {proceduralAudioEnabled && (
              <View style={{ paddingLeft: 20, paddingBottom: 10 }}>
                <SettingsItem
                  theme={theme}
                  icon="headset-outline"
                  label="Arkaplan Müziği"
                  value={synthMusicEnabled}
                  onValueChange={toggleSynthMusic}
                />
                <SettingsItem
                  theme={theme}
                  icon="keypad-outline"
                  label="Terminal Klavye Sesi"
                  value={synthKeyboardEnabled}
                  onValueChange={toggleSynthKeyboard}
                />
                <SettingsItem
                  theme={theme}
                  icon="megaphone-outline"
                  label="Yapay Zeka Sesi (TTS)"
                  value={ttsEnabled}
                  onValueChange={toggleTts}
                />
              </View>
            )}
            <CyberSynth />
            <SettingsItem
              theme={theme}
              icon="terminal-outline"
              label="Terminal Modu"
              value={terminalModeEnabled}
              onValueChange={toggleTerminalMode}
            />
            <SettingsItem
              theme={theme}
              icon="tv-outline"
              label="CRT Filtresi"
              value={crtFilterEnabled}
              onValueChange={toggleCrtFilter}
            />
            <SettingsItem
              theme={theme}
              icon="finger-print"
              label="Haptik Geri Bildirim"
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSec, marginTop: 25 }]}>HAKKINDA</Text>
          <View style={[styles.section, { backgroundColor: theme.card }]}>
             <View style={[styles.itemContainer, { borderBottomWidth: 0 }]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
                    <Ionicons name="information-circle" size={22} color={theme.textSec} />
                  </View>
                  <View>
                    <Text style={[styles.itemLabel, { color: theme.text }]}>GlassBook</Text>
                    <Text style={{ color: theme.textSec, fontSize: 12 }}>Versiyon 1.5.0 (Effect Update)</Text>
                  </View>
                </View>
             </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 10,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  swatchContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  activeSwatch: {
    borderWidth: 3,
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  effectOption: {
    width: 80,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  effectLabel: {
    fontSize: 10,
    fontWeight: '600',
  }
});

export default SettingsScreen;