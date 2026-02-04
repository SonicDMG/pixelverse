import { useRef, useCallback, useEffect, useState } from 'react';
import { WebSpeechTTS, CyberpunkVoiceSettings, AudioEffectSettings } from '@/utils/tts-web-speech';

export type AnnouncementType = 'alert' | 'info' | 'price';

interface UseCyberpunkVoiceOptions {
  audioContext: AudioContext | null;
}

interface UseCyberpunkVoiceReturn {
  announce: (text: string, type?: AnnouncementType) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  isEnabled: boolean;
  toggleEnabled: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

/**
 * Custom React hook for cyberpunk-themed text-to-speech announcements
 * Wraps the WebSpeechTTS class with React lifecycle management
 * Provides different voice settings based on announcement type
 */
export function useCyberpunkVoice(
  options: UseCyberpunkVoiceOptions
): UseCyberpunkVoiceReturn {
  const { audioContext } = options;
  const ttsRef = useRef<WebSpeechTTS | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const [isEnabled, setIsEnabled] = useState(true); // Voice enabled by default
  const [volume, setVolumeState] = useState(0.75); // Default volume from voice settings

  // Initialize TTS when audio context is available
  useEffect(() => {
    if (audioContext && !ttsRef.current) {
      try {
        ttsRef.current = new WebSpeechTTS(audioContext);
        console.log('Cyberpunk voice initialized');
      } catch (error) {
        console.error('Failed to initialize cyberpunk voice:', error);
      }
    }
  }, [audioContext]);

  /**
   * Set volume level
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  /**
   * Get voice settings based on announcement type
   */
  const getVoiceSettings = useCallback((type: AnnouncementType): CyberpunkVoiceSettings => {
    switch (type) {
      case 'alert':
        // Urgent, attention-grabbing
        return {
          pitch: 0.7, // Lower, more serious
          rate: 1.0, // Normal speed for clarity
          volume: volume, // Use current volume setting
        };
      
      case 'info':
        // Informative, robotic
        return {
          pitch: 0.8, // Slightly lower
          rate: 1.1, // Slightly faster
          volume: volume, // Use current volume setting
        };
      
      case 'price':
        // Quick, digital readout
        return {
          pitch: 0.75, // Lower for authority
          rate: 1.2, // Faster for efficiency
          volume: volume, // Use current volume setting
        };
      
      default:
        return {
          pitch: 0.8,
          rate: 1.1,
          volume: volume, // Use current volume setting
        };
    }
  }, [volume]);

  /**
   * Get audio effects based on announcement type
   */
  const getAudioEffects = useCallback((type: AnnouncementType): AudioEffectSettings => {
    switch (type) {
      case 'alert':
        // Heavy effects for urgency
        return {
          bitcrush: true,
          lowpass: true,
          distortion: true,
          reverb: true,
        };
      
      case 'info':
        // Moderate effects for clarity
        return {
          bitcrush: true,
          lowpass: true,
          distortion: false,
          reverb: false,
        };
      
      case 'price':
        // Light effects for quick readability
        return {
          bitcrush: false,
          lowpass: true,
          distortion: false,
          reverb: false,
        };
      
      default:
        return {
          bitcrush: true,
          lowpass: true,
          distortion: false,
          reverb: false,
        };
    }
  }, []);

  /**
   * Preprocess text for better speech synthesis
   */
  const preprocessText = useCallback((text: string, type: AnnouncementType): string => {
    let processed = text;

    // Handle dollar signs
    processed = processed.replace(/\$(\d+(?:\.\d{2})?)/g, '$1 dollars');
    
    // Handle percentages
    processed = processed.replace(/(\d+(?:\.\d+)?)%/g, '$1 percent');
    
    // Handle stock symbols (e.g., AAPL -> A A P L)
    processed = processed.replace(/\b([A-Z]{2,5})\b/g, (match) => {
      return match.split('').join(' ');
    });

    // Add pauses for alerts
    if (type === 'alert') {
      processed = 'Alert. ' + processed;
      // Add pauses between sentences
      processed = processed.replace(/\.\s+/g, '. ... ');
    }

    // Add emphasis for price announcements
    if (type === 'price') {
      processed = processed.replace(/up|down|gain|loss/gi, (match) => {
        return ` ${match} `;
      });
    }

    return processed;
  }, []);

  /**
   * Toggle voice enabled/disabled
   */
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      // Stop speech when disabling
      if (!newValue && ttsRef.current) {
        ttsRef.current.stop();
        isSpeakingRef.current = false;
      }
      return newValue;
    });
  }, []);

  /**
   * Announce text with cyberpunk voice effects
   */
  const announce = useCallback(async (
    text: string,
    type: AnnouncementType = 'info'
  ): Promise<void> => {
    // Don't announce if voice is disabled
    if (!isEnabled) {
      return;
    }

    if (!ttsRef.current) {
      console.warn('TTS not initialized');
      return;
    }

    try {
      // Stop any ongoing speech
      if (isSpeakingRef.current) {
        ttsRef.current.stop();
      }

      isSpeakingRef.current = true;

      // Preprocess text
      const processedText = preprocessText(text, type);

      // Get settings for this announcement type
      const voiceSettings = getVoiceSettings(type);
      const audioEffects = getAudioEffects(type);

      console.log(`Announcing (${type}): ${processedText}`);

      // Speak with effects
      await ttsRef.current.speak(processedText, voiceSettings, audioEffects);

      isSpeakingRef.current = false;
    } catch (error) {
      isSpeakingRef.current = false;
      
      // Check if it's an interruption error (normal behavior)
      if (error instanceof Error && error.message.includes('interrupted')) {
        console.log('[Voice] Speech interrupted (normal behavior)');
        return; // Don't throw for interruptions
      }
      
      // Log and throw actual errors
      console.error('Failed to announce:', error);
      throw error;
    }
  }, [isEnabled, preprocessText, getVoiceSettings, getAudioEffects]);

  /**
   * Stop any ongoing speech
   */
  const stop = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop();
      isSpeakingRef.current = false;
    }
  }, []);

  /**
   * Check if currently speaking
   */
  const isSpeaking = ttsRef.current?.isSpeaking() || false;

  /**
   * Check if speech synthesis is supported
   */
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    announce,
    stop,
    isSpeaking,
    isSupported,
    isEnabled,
    toggleEnabled,
    volume,
    setVolume,
  };
}

// Made with Bob