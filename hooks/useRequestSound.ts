import { useEffect, useRef, useCallback, useState } from 'react';
import { generateRequestBeep } from '@/utils/generate-request-beep';

interface UseRequestSoundOptions {
  volume?: number; // 0.0 to 1.0
  enabled?: boolean;
}

interface UseRequestSoundReturn {
  playRequestSound: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isReady: boolean;
}

/**
 * Custom hook for playing a request submission sound
 * Generates a short, sharp beep programmatically using Web Audio API
 * Handles errors gracefully and respects user preferences
 */
export function useRequestSound(
  options: UseRequestSoundOptions = {}
): UseRequestSoundReturn {
  const { volume: initialVolume = 0.25, enabled: initialEnabled = true } = options;
  
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
      
      // Generate the request beep sound buffer
      audioBufferRef.current = generateRequestBeep(audioContextRef.current);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize request sound:', error);
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
   * Play the request sound
   * Handles errors gracefully and won't break the app if playback fails
   */
  const playRequestSound = useCallback(() => {
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
      console.error('Failed to play request sound:', error);
    }
  }, [isEnabled, isReady, volume]);

  return {
    playRequestSound,
    isEnabled,
    setEnabled: setIsEnabled,
    volume,
    setVolume,
    isReady,
  };
}

// Made with Bob