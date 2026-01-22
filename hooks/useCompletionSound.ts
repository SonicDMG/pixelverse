import { useEffect, useRef, useCallback, useState } from 'react';
import { generateChaChing } from '@/utils/generate-cha-ching';
import { AUDIO } from '@/constants/theme';

interface UseCompletionSoundOptions {
  volume?: number; // 0.0 to 1.0
  enabled?: boolean;
}

interface UseCompletionSoundReturn {
  playCompletionSound: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isReady: boolean;
}

/**
 * Custom hook for playing a "cha ching" completion sound
 * Generates the sound programmatically using Web Audio API
 * Handles errors gracefully and respects user preferences
 */
export function useCompletionSound(
  options: UseCompletionSoundOptions = {}
): UseCompletionSoundReturn {
  const { volume: initialVolume = AUDIO.soundEffectsVolume, enabled: initialEnabled = true } = options;
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio context and generate sound
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    try {
      // Create audio context (with fallback for older browsers)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser');
        return;
      }

      audioContextRef.current = new AudioContextClass();
      
      // Generate the cha-ching sound buffer
      audioBufferRef.current = generateChaChing(audioContextRef.current);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize completion sound:', error);
      setIsReady(false);
    }

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => {
          console.error('Error closing audio context:', err);
        });
      }
    };
  }, []);

  /**
   * Play the completion sound
   * Handles errors gracefully and won't break the app if playback fails
   */
  const playCompletionSound = useCallback(() => {
    // Don't play if disabled or not ready
    if (!isEnabled || !isReady || !audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    try {
      const audioContext = audioContextRef.current;
      const audioBuffer = audioBufferRef.current;

      // Resume audio context if it's suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => {
          console.error('Failed to resume audio context:', err);
        });
      }

      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

      // Connect nodes: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play the sound
      source.start(0);

      // Clean up the source after it finishes playing
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      // Log error but don't throw - we don't want to break the app
      console.error('Failed to play completion sound:', error);
    }
  }, [isEnabled, isReady, volume]);

  return {
    playCompletionSound,
    isEnabled,
    setEnabled: setIsEnabled,
    volume,
    setVolume,
    isReady,
  };
}

// Made with Bob
