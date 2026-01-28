'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBackgroundMusic } from './useBackgroundMusic';
import { useCyberpunkVoice, AnnouncementType } from './useCyberpunkVoice';
import { ThemeConfig } from '@/constants/theme';

/**
 * Audio Controls Hook
 * 
 * Manages all audio-related state and controls including background music
 * and voice synthesis. Provides a unified interface for audio features.
 * 
 * @param appMode - Current app mode/theme ID
 * @param theme - Current theme configuration
 * @returns Audio controls interface
 * 
 * @example
 * ```tsx
 * const audio = useAudioControls('ticker', theme);
 * 
 * // Control music
 * audio.toggleMusic();
 * audio.setMusicVolume(0.5);
 * 
 * // Control voice
 * audio.toggleVoice();
 * await audio.announce('Hello world', 'info');
 * ```
 */
export function useAudioControls(appMode: string, theme: ThemeConfig) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize shared AudioContext for voice synthesis
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined' && !audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        setAudioContext(ctx);
      }
    }

    return () => {
      if (audioContext) {
        audioContext.close().catch(err => console.error('Error closing audio context:', err));
      }
    };
  }, []);

  // Use MP3 background music
  const {
    isPlaying: isMusicPlaying,
    isMuted: isMusicMuted,
    togglePlayback: toggleMusic,
    toggleMute: toggleMusicMute,
    isReady: isMusicReady,
    analyserNode,
    volume: musicVolume,
    setVolume: setMusicVolume,
    currentSong,
    availableSongs,
    isAutoCycling,
    setSong,
    start: startMusic,
    stop: stopMusic,
  } = useBackgroundMusic(appMode, {
    volume: 0.175,
    autoPlay: false // Can't autoplay due to browser policy - user must click
  });

  // Voice synthesis
  const {
    announce,
    isSupported: isVoiceSupported,
    isEnabled: isVoiceEnabled,
    toggleEnabled: toggleVoice,
    volume: voiceVolume,
    setVolume: setVoiceVolume,
  } = useCyberpunkVoice({ audioContext });

  /**
   * Announce a message with voice synthesis
   * Includes preprocessing for better speech quality
   */
  const announceWithVoice = useCallback(async (
    text: string,
    type: AnnouncementType = 'info'
  ): Promise<void> => {
    if (!isVoiceSupported || !isVoiceEnabled) {
      return;
    }

    try {
      await announce(text, type);
    } catch (err) {
      console.error('Voice announcement failed:', err);
    }
  }, [announce, isVoiceSupported, isVoiceEnabled]);

  return {
    // Music controls
    isMusicPlaying,
    isMusicMuted,
    isMusicReady,
    musicVolume,
    currentSong,
    availableSongs,
    isAutoCycling,
    analyserNode,
    toggleMusic,
    toggleMusicMute,
    setMusicVolume,
    setSong,
    startMusic,
    stopMusic,
    
    // Voice controls
    isVoiceSupported,
    isVoiceEnabled,
    voiceVolume,
    toggleVoice,
    setVoiceVolume,
    announceWithVoice,
    
    // Shared state
    isMounted,
    audioContext,
  };
}

// Made with Bob