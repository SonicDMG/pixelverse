import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { createTickerMusic, TickerMusicGenerator } from '@/utils/generate-ticker-music';
import { createSpaceMusic, SpaceMusicGenerator } from '@/utils/generate-space-music';

interface UseProceduralMusicOptions {
  volume?: number; // 0.0 to 1.0
  autoPlay?: boolean; // Whether to start automatically (subject to browser policies)
}

interface UseProceduralMusicReturn {
  isPlaying: boolean;
  isMuted: boolean;
  togglePlayback: () => void;
  toggleMute: () => void;
  start: () => void;
  stop: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  isReady: boolean;
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
}

/**
 * Custom hook for playing procedurally generated music using Tone.js
 * Provides the same interface as useBackgroundMusic for easy swapping
 * 
 * @param themeId - The theme identifier (e.g., 'ticker', 'space')
 * @param options - Configuration options for volume and autoplay
 */
export function useProceduralMusic(
  themeId: string,
  options: UseProceduralMusicOptions = {}
): UseProceduralMusicReturn {
  const { volume: initialVolume = 0.175, autoPlay = false } = options;
  
  // Music generator reference
  const generatorRef = useRef<TickerMusicGenerator | SpaceMusicGenerator | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);

  /**
   * Initialize Tone.js and create the appropriate music generator
   */
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    let mounted = true;

    const initialize = async () => {
      try {
        console.log(`[Procedural Music] Initializing for theme: ${themeId}`);

        // Create the appropriate music generator based on theme
        let generator: TickerMusicGenerator | SpaceMusicGenerator;
        
        if (themeId === 'ticker') {
          console.log('[Procedural Music] Creating ticker music generator');
          generator = createTickerMusic();
        } else if (themeId === 'space') {
          console.log('[Procedural Music] Creating space music generator');
          generator = createSpaceMusic();
        } else {
          console.warn(`[Procedural Music] Unknown theme: ${themeId}, defaulting to ticker`);
          generator = createTickerMusic();
        }

        // Initialize the generator
        console.log('[Procedural Music] Initializing generator...');
        await generator.initialize();
        
        if (!mounted) {
          console.log('[Procedural Music] Component unmounted during init, disposing');
          generator.dispose();
          return;
        }

        generatorRef.current = generator;

        // Set initial volume and mute state
        generator.setVolume(volume);
        if (isMuted) {
          generator.setMuted(true);
        }

        // Create analyser node for visualization
        // Get Tone.js context and create analyser
        const toneContext = Tone.getContext();
        const analyser = toneContext.createAnalyser();
        analyser.fftSize = 256; // 128 frequency bins
        analyser.smoothingTimeConstant = 0.8;
        
        // Connect Tone.js destination to analyser
        Tone.getDestination().connect(analyser);
        analyserNodeRef.current = analyser;

        console.log('[Procedural Music] ✓ Initialized successfully');
        setIsReady(true);

        // Auto-play if requested
        if (autoPlay) {
          console.log('[Procedural Music] Auto-play enabled, starting in 100ms');
          setTimeout(() => {
            start();
          }, 100);
        }
      } catch (error) {
        console.error('[Procedural Music] ✗ Failed to initialize:', error);
        setIsReady(false);
      }
    };

    initialize();

    // Cleanup
    return () => {
      mounted = false;
      
      if (generatorRef.current) {
        generatorRef.current.dispose();
        generatorRef.current = null;
      }

      if (analyserNodeRef.current) {
        analyserNodeRef.current.disconnect();
        analyserNodeRef.current = null;
      }
    };
  }, [themeId]); // Re-initialize when theme changes

  /**
   * Start playing the procedural music
   */
  const start = useCallback(async () => {
    if (!isReady || !generatorRef.current) {
      console.warn('[Procedural Music] Not ready - isReady:', isReady, 'generator:', !!generatorRef.current);
      return;
    }

    // Don't start if already playing
    if (isPlaying) {
      console.log('[Procedural Music] Already playing, skipping start');
      return;
    }

    try {
      console.log('[Procedural Music] Starting Tone.js audio context...');
      // Start Tone.js audio context (required for user interaction)
      await Tone.start();
      console.log('[Procedural Music] ✓ Tone.js audio context started, state:', Tone.getContext().state);

      // Start the music generator
      console.log('[Procedural Music] Starting music generator...');
      generatorRef.current.start();
      
      setIsPlaying(true);
      console.log('[Procedural Music] ✓ Procedural music started successfully');
    } catch (error) {
      console.error('[Procedural Music] ✗ Failed to start:', error);
      setIsPlaying(false);
    }
  }, [isReady, isPlaying]);

  /**
   * Stop playing the procedural music
   */
  const stop = useCallback(() => {
    if (!isPlaying || !generatorRef.current) {
      console.log('[Procedural Music] Stop called but not playing or no generator');
      return;
    }

    try {
      console.log('[Procedural Music] Stopping music generator...');
      generatorRef.current.stop();
      setIsPlaying(false);
      console.log('[Procedural Music] ✓ Procedural music stopped');
    } catch (error) {
      console.error('[Procedural Music] ✗ Failed to stop:', error);
    }
  }, [isPlaying]);

  /**
   * Toggle playback on/off
   */
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  /**
   * Toggle mute on/off
   */
  const toggleMute = useCallback(() => {
    if (!generatorRef.current) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    generatorRef.current.setMuted(newMutedState);
    
    console.log(`Procedural music ${newMutedState ? 'muted' : 'unmuted'}`);
  }, [isMuted]);

  /**
   * Set volume level
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (!generatorRef.current || isMuted) return;

    generatorRef.current.setVolume(clampedVolume);
  }, [isMuted]);

  // Update volume when it changes
  useEffect(() => {
    if (generatorRef.current && !isMuted) {
      generatorRef.current.setVolume(volume);
    }
  }, [volume, isMuted]);

  return {
    isPlaying,
    isMuted,
    togglePlayback,
    toggleMute,
    start,
    stop,
    volume,
    setVolume,
    isReady,
    audioContext: Tone.getContext().rawContext as AudioContext,
    analyserNode: analyserNodeRef.current,
  };
}

// Made with Bob
