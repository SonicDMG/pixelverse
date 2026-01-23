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
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
}

interface AudioTrack {
  buffer: AudioBuffer;
  filename: string;
}

/**
 * Custom hook for playing MP3 background music with crossfading
 * Dynamically discovers and plays all MP3 files from theme-specific directories
 * Implements smooth crossfading between tracks using dual audio sources
 * Loops continuously through all available tracks like a radio station
 *
 * @param themeId - The theme identifier (e.g., 'ticker', 'space')
 * @param options - Configuration options for volume and autoplay
 */
export function useBackgroundMusic(
  themeId: string,
  options: UseBackgroundMusicOptions = {}
): UseBackgroundMusicReturn {
  const { volume: initialVolume = 0.175, autoPlay = false } = options;
  
  // Audio context and nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  // Dual audio sources for crossfading
  const sourceARef = useRef<AudioBufferSourceNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const sourceBRef = useRef<AudioBufferSourceNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  
  // Track management
  const tracksRef = useRef<AudioTrack[]>([]);
  const playlistRef = useRef<number[]>([]); // Shuffled playlist of track indices
  const playlistPositionRef = useRef<number>(0); // Current position in playlist
  const activeSourceRef = useRef<'A' | 'B'>('A'); // Which source is currently playing
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);
  
  // Crossfade configuration
  const CROSSFADE_DURATION = 2.5; // seconds

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * Creates a randomized playlist without modifying the original tracks array
   */
  const shufflePlaylist = useCallback((trackCount: number): number[] => {
    const indices = Array.from({ length: trackCount }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    console.log('Shuffled playlist:', indices);
    return indices;
  }, []);

  /**
   * Load all MP3 files from the theme-specific music directory
   * Fetches the file list from the API and loads each track
   */
  const loadMusicTracks = useCallback(async (audioContext: AudioContext): Promise<AudioTrack[]> => {
    try {
      // Fetch the list of music files for this theme from the API
      console.log(`Fetching music files for theme: ${themeId}`);
      const apiResponse = await fetch(`/api/music/${themeId}`);
      
      if (!apiResponse.ok) {
        console.error(`Failed to fetch music file list: ${apiResponse.status} ${apiResponse.statusText}`);
        return [];
      }

      const data = await apiResponse.json();
      const musicFiles: string[] = data.files || [];

      if (musicFiles.length === 0) {
        console.warn(`No music files found for theme: ${themeId}`);
        return [];
      }

      console.log(`Found ${musicFiles.length} music files for theme ${themeId}:`, musicFiles);

      const tracks: AudioTrack[] = [];

      // Load each music file from the theme-specific directory
      for (const filename of musicFiles) {
        try {
          const filePath = `/audio/music/${themeId}/${encodeURIComponent(filename)}`;
          console.log(`Loading: ${filePath}`);
          
          const response = await fetch(filePath);
          if (!response.ok) {
            console.warn(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          tracks.push({
            buffer: audioBuffer,
            filename
          });
          
          console.log(`✓ Loaded track: ${filename} (${audioBuffer.duration.toFixed(1)}s)`);
        } catch (error) {
          console.error(`Error loading ${filename}:`, error);
        }
      }

      if (tracks.length === 0) {
        console.error(`No tracks successfully loaded for theme: ${themeId}`);
      } else {
        console.log(`Successfully loaded ${tracks.length}/${musicFiles.length} tracks for theme: ${themeId}`);
      }

      return tracks;
    } catch (error) {
      console.error(`Failed to load music tracks for theme ${themeId}:`, error);
      return [];
    }
  }, [themeId]);

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
        
        // Create analyser node for visualization
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // 128 frequency bins
        analyser.smoothingTimeConstant = 0.8;
        analyserNodeRef.current = analyser;
        
        // Create master gain node for overall volume control
        const masterGain = audioContext.createGain();
        masterGain.gain.value = isMuted ? 0 : volume;
        masterGain.connect(analyser);
        analyser.connect(audioContext.destination);
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
        
        // Create initial shuffled playlist
        playlistRef.current = shufflePlaylist(tracks.length);
        playlistPositionRef.current = 0;
        
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
  }, [themeId, loadMusicTracks, autoPlay]); // Re-initialize when theme changes

  /**
   * Play a track on the specified source with crossfade
   */
  const playTrackOnSource = useCallback((
    playlistPosition: number,
    source: 'A' | 'B',
    fadeIn: boolean = false
  ) => {
    const audioContext = audioContextRef.current;
    const tracks = tracksRef.current;
    const playlist = playlistRef.current;
    
    if (!audioContext || !tracks || tracks.length === 0 || playlist.length === 0) {
      console.warn('Cannot play track: not ready');
      return;
    }

    const trackIndex = playlist[playlistPosition];
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
      const nextPlaylistPosition = playlistPosition + 1;
      
      // Check if we need to reshuffle (reached end of playlist)
      let actualNextPosition = nextPlaylistPosition;
      if (nextPlaylistPosition >= playlist.length) {
        // Reshuffle for next round
        console.log('End of playlist reached, reshuffling...');
        playlistRef.current = shufflePlaylist(tracks.length);
        actualNextPosition = 0;
      }
      
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
        playlistPositionRef.current = actualNextPosition;
        playTrackOnSource(actualNextPosition, nextSource, true);
        
        const nextTrackIndex = playlistRef.current[actualNextPosition];
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

      // Start playing first track from shuffled playlist on source A
      activeSourceRef.current = 'A';
      playlistPositionRef.current = 0;
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
    audioContext: audioContextRef.current,
    analyserNode: analyserNodeRef.current,
  };
}

// Made with Bob