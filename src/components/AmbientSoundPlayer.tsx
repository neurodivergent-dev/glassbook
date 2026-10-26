import React, { useEffect, useMemo } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';

const AmbientSoundPlayer = () => {
  const { ambientSoundId, isAmbientEnabled, ambientSounds } = useTheme();
  
  const source = useMemo(() => {
    const current = ambientSounds[ambientSoundId];
    if (isAmbientEnabled && current && current.url) {
      return { uri: current.url };
    }
    return null;
  }, [ambientSoundId, isAmbientEnabled, ambientSounds]);

  const player = useAudioPlayer(source);

  useEffect(() => {
    if (!player) return;

    player.loop = true;
    player.volume = 0.5;

    if (isAmbientEnabled && source) {
      player.play();
    } else {
      player.pause();
    }
  }, [isAmbientEnabled, source, player]);

  return null;
};

export default AmbientSoundPlayer;