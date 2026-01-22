import { useEffect, useRef, useCallback, useState } from 'react';

interface UseBackgroundMusicOptions {
  volume?: number; // 0.0 to 1.0
  autoPlay?: boolean; // Whether to start automatically (subject to browser policies)
}

interface UseBackgroundMusicReturn {
  isPlaying: boolean;
  isMuted: boolean;
  togglePlayback: () => void;
  toggleMute: () => void;
  start: () => void;
  stop: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  isReady: boolean;
}

interface AudioTrack {
  buffer: AudioBuffer;
  filename: string;
}

/**
 * Custom hook for playing MP3 background music with crossfading
 * Automatically discovers and plays all MP3 files from /audio/music/
 * Implements smooth crossfading between tracks using dual audio sources
 * Loops continuously through all available tracks like a radio station
 */
export function useBackgroundMusic(
  options: UseBackgroundMusicOptions = {}
): UseBackgroundMusicReturn {
  const { volume: initialVolume = 0.175, autoPlay = false } = options;
  
  // Audio context and nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  
  // Dual audio sources for crossfading
  const sourceARef = useRef<AudioBufferSourceNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const sourceBRef = useRef<AudioBufferSourceNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  
  // Track management
  const tracksRef = useRef<AudioTrack[]>([]);
  const currentTrackIndexRef = useRef<number>(0);
  const activeSourceRef = useRef<'A' | 'B'>('A'); // Which source is currently playing
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);
  
  // Crossfade configuration
  const CROSSFADE_DURATION = 2.5; // seconds

  /**
   * Load all MP3 files from the music directory
   */
  const loadMusicTracks = useCallback(async (audioContext: AudioContext): Promise<AudioTrack[]> => {
    // Hardcoded list of MP3 files (in a real app, you'd fetch this from an API)
    const musicFiles = [
      'Push Thru - The Grey Room _ Golden Palms.mp3',
      'The Fifth Quadrant - Dan _Lebo_ Lebowitz, Tone Seeker.mp3'
    ];

    const tracks: AudioTrack[] = [];

    for (const filename of musicFiles) {
      try {
        const response = await fetch(`/audio/music/${encodeURIComponent(filename)}`);
        if (!response.ok) {
          console.warn(`Failed to load ${filename}: ${response.statusText}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        tracks.push({
          buffer: audioBuffer,
          filename
        });
        
        console.log(`Loaded track: ${filename} (${audioBuffer.duration.toFixed(1)}s)`);
      } catch (error) {
        console.error(`Error loading ${filename}:`, error);
      }
    }

    return tracks;
  }, []);

  /**
   * Initialize audio context and load all tracks
   */
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    let mounted = true;

    const initialize = async () => {
      try {
        // Create audio context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('Web Audio API not supported in this browser');
          return;
        }

        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        
        // Create master gain node for overall volume control
        const masterGain = audioContext.createGain();
        masterGain.gain.value = isMuted ? 0 : volume;
        masterGain.connect(audioContext.destination);
        masterGainNodeRef.current = masterGain;
        
        // Create gain nodes for each source (for crossfading)
        const gainA = audioContext.createGain();
        gainA.gain.value = 1.0;
        gainA.connect(masterGain);
        gainARef.current = gainA;
        
        const gainB = audioContext.createGain();
        gainB.gain.value = 0.0; // Start silent
        gainB.connect(masterGain);
        gainBRef.current = gainB;
        
        // Load all music tracks
        console.log('Loading music tracks...');
        const tracks = await loadMusicTracks(audioContext);
        
        if (!mounted) return;
        
        if (tracks.length === 0) {
          console.error('No music tracks loaded');
          return;
        }
        
        tracksRef.current = tracks;
        console.log(`Loaded ${tracks.length} tracks`);
        setIsReady(true);

        // Auto-play if requested
        if (autoPlay) {
          setTimeout(() => {
            start();
          }, 100);
        }
      } catch (error) {
        console.error('Failed to initialize background music:', error);
        setIsReady(false);
      }
    };

    initialize();

    // Cleanup
    return () => {
      mounted = false;
      
      if (sourceARef.current) {
        try {
          sourceARef.current.stop();
          sourceARef.current.disconnect();
        } catch (e) {
          // Ignore errors during cleanup
        }
        sourceARef.current = null;
      }
      
      if (sourceBRef.current) {
        try {
          sourceBRef.current.stop();
          sourceBRef.current.disconnect();
        } catch (e) {
          // Ignore errors during cleanup
        }
        sourceBRef.current = null;
      }
      
      if (gainARef.current) {
        gainARef.current.disconnect();
        gainARef.current = null;
      }
      
      if (gainBRef.current) {
        gainBRef.current.disconnect();
        gainBRef.current = null;
      }
      
      if (masterGainNodeRef.current) {
        masterGainNodeRef.current.disconnect();
        masterGainNodeRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => {
          console.error('Error closing audio context:', err);
        });
      }
    };
  }, []); // Only run once on mount

  /**
   * Play a track on the specified source with crossfade
   */
  const playTrackOnSource = useCallback((
    trackIndex: number,
    source: 'A' | 'B',
    fadeIn: boolean = false
  ) => {
    const audioContext = audioContextRef.current;
    const tracks = tracksRef.current;
    
    if (!audioContext || !tracks || tracks.length === 0) {
      console.warn('Cannot play track: not ready');
      return;
    }

    const track = tracks[trackIndex];
    const sourceRef = source === 'A' ? sourceARef : sourceBRef;
    const gainRef = source === 'A' ? gainARef : gainBRef;
    const gainNode = gainRef.current;
    
    if (!gainNode) {
      console.warn('Gain node not available');
      return;
    }

    try {
      // Stop existing source if any
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        } catch (e) {
          // Ignore errors
        }
      }

      // Create new source
      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = track.buffer;
      bufferSource.connect(gainNode);
      
      // Set up fade in if requested
      const currentTime = audioContext.currentTime;
      if (fadeIn) {
        gainNode.gain.cancelScheduledValues(currentTime);
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, currentTime + CROSSFADE_DURATION);
      } else {
        gainNode.gain.setValueAtTime(1.0, currentTime);
      }

      // Schedule next track before this one ends (for crossfade)
      const nextTrackIndex = (trackIndex + 1) % tracks.length;
      const crossfadeStartTime = track.buffer.duration - CROSSFADE_DURATION;
      
      bufferSource.addEventListener('ended', () => {
        // This track has ended, clean up
        if (sourceRef.current === bufferSource) {
          sourceRef.current = null;
        }
      });

      // Schedule crossfade to next track
      setTimeout(() => {
        // Check if we should continue playing by checking the source refs
        // If both sources are null, playback was stopped
        if (!sourceARef.current && !sourceBRef.current) {
          console.log('Playback stopped, not scheduling next track');
          return;
        }
        
        // Determine which source to use for next track
        const nextSource = source === 'A' ? 'B' : 'A';
        const currentGainNode = gainRef.current;
        
        if (currentGainNode && audioContext) {
          // Fade out current track
          const fadeStartTime = audioContext.currentTime;
          currentGainNode.gain.cancelScheduledValues(fadeStartTime);
          currentGainNode.gain.setValueAtTime(1.0, fadeStartTime);
          currentGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + CROSSFADE_DURATION);
        }
        
        // Play next track with fade in
        activeSourceRef.current = nextSource;
        currentTrackIndexRef.current = nextTrackIndex;
        playTrackOnSource(nextTrackIndex, nextSource, true);
        
        console.log(`Crossfading to: ${tracks[nextTrackIndex].filename}`);
      }, crossfadeStartTime * 1000);

      // Start playback
      bufferSource.start(0);
      sourceRef.current = bufferSource;
      
      console.log(`Playing on source ${source}: ${track.filename}`);
    } catch (error) {
      console.error(`Failed to play track on source ${source}:`, error);
    }
  }, [CROSSFADE_DURATION]);

  /**
   * Start playing the background music
   */
  const start = useCallback(() => {
    if (!isReady || !audioContextRef.current || tracksRef.current.length === 0) {
      console.warn('Background music not ready');
      return;
    }

    // Don't start if already playing
    if (isPlaying) {
      return;
    }

    try {
      const audioContext = audioContextRef.current;

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed');
        }).catch(err => {
          console.error('Failed to resume audio context:', err);
        });
      }

      // Start playing first track on source A
      activeSourceRef.current = 'A';
      currentTrackIndexRef.current = 0;
      playTrackOnSource(0, 'A', false);
      
      setIsPlaying(true);
      console.log('Background music started');
    } catch (error) {
      console.error('Failed to start background music:', error);
      setIsPlaying(false);
    }
  }, [isReady, isPlaying, playTrackOnSource]);

  /**
   * Stop playing the background music
   */
  const stop = useCallback(() => {
    if (!isPlaying) {
      return;
    }

    try {
      // Stop both sources
      if (sourceARef.current) {
        sourceARef.current.stop();
        sourceARef.current.disconnect();
        sourceARef.current = null;
      }
      
      if (sourceBRef.current) {
        sourceBRef.current.stop();
        sourceBRef.current.disconnect();
        sourceBRef.current = null;
      }
      
      // Reset gain values
      if (gainARef.current) {
        gainARef.current.gain.value = 1.0;
      }
      if (gainBRef.current) {
        gainBRef.current.gain.value = 0.0;
      }
      
      setIsPlaying(false);
      console.log('Background music stopped');
    } catch (error) {
      console.error('Failed to stop background music:', error);
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
    if (!masterGainNodeRef.current) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Smoothly transition volume to prevent clicks
    const currentTime = audioContextRef.current?.currentTime || 0;
    const masterGain = masterGainNodeRef.current;
    masterGain.gain.cancelScheduledValues(currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, currentTime);
    masterGain.gain.linearRampToValueAtTime(
      newMutedState ? 0 : volume,
      currentTime + 0.05 // 50ms fade
    );
  }, [isMuted, volume]);

  /**
   * Set volume level
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (!masterGainNodeRef.current || isMuted) return;

    // Smoothly transition volume
    const currentTime = audioContextRef.current?.currentTime || 0;
    const masterGain = masterGainNodeRef.current;
    masterGain.gain.cancelScheduledValues(currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, currentTime);
    masterGain.gain.linearRampToValueAtTime(
      clampedVolume,
      currentTime + 0.05 // 50ms fade
    );
  }, [isMuted]);

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
  };
}

// Made with Bob