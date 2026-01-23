import { useEffect, useRef, useCallback, useState } from 'react';

interface UseBackgroundMusicOptions {
  volume?: number; // 0.0 to 1.0
  autoPlay?: boolean; // Whether to start automatically (subject to browser policies)
}

// Song info interface for MP3 tracks
export interface SongInfo {
  id: number;
  name: string;
  filename: string;
  bpm?: number; // Optional - not always known for MP3s
  description?: string; // Optional - for display purposes
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
  // Song selection
  currentSong: SongInfo | null;
  availableSongs: SongInfo[];
  isAutoCycling: boolean;
  setSong: (songId: number | null) => void;
}

interface AudioTrack {
  buffer: AudioBuffer | null; // null means not loaded yet
  filename: string;
  isLoading?: boolean;
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
  const manualSongIndexRef = useRef<number | null>(null); // Manual song selection (null = auto-cycle)
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isReady, setIsReady] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const [availableSongs, setAvailableSongs] = useState<SongInfo[]>([]);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  
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
   * Fetch the list of music files (without loading them)
   */
  const fetchMusicFileList = useCallback(async (): Promise<string[]> => {
    try {
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

      console.log(`Found ${musicFiles.length} music files for theme ${themeId}`);
      return musicFiles;
    } catch (error) {
      console.error(`Failed to fetch music file list for theme ${themeId}:`, error);
      return [];
    }
  }, [themeId]);

  /**
   * Load a single track on-demand
   */
  const loadSingleTrack = useCallback(async (
    filename: string,
    audioContext: AudioContext
  ): Promise<AudioBuffer | null> => {
    try {
      const filePath = `/audio/music/${themeId}/${encodeURIComponent(filename)}`;
      console.log(`Lazy loading: ${filePath}`);
      
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log(`✓ Loaded track: ${filename} (${audioBuffer.duration.toFixed(1)}s)`);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }, [themeId]);

  /**
   * Initialize track list with only the first track loaded
   */
  const initializeMusicTracks = useCallback(async (audioContext: AudioContext): Promise<AudioTrack[]> => {
    try {
      // Fetch file list
      const musicFiles = await fetchMusicFileList();
      
      if (musicFiles.length === 0) {
        return [];
      }

      // Create track list with only first track loaded
      const tracks: AudioTrack[] = [];
      
      for (let i = 0; i < musicFiles.length; i++) {
        const filename = musicFiles[i];
        
        if (i === 0) {
          // Load first track immediately
          const buffer = await loadSingleTrack(filename, audioContext);
          tracks.push({
            buffer,
            filename,
            isLoading: false
          });
        } else {
          // Other tracks start as unloaded
          tracks.push({
            buffer: null,
            filename,
            isLoading: false
          });
        }
      }

      console.log(`Initialized ${tracks.length} tracks (1 loaded, ${tracks.length - 1} lazy)`);
      return tracks;
    } catch (error) {
      console.error(`Failed to initialize music tracks for theme ${themeId}:`, error);
      return [];
    }
  }, [themeId, fetchMusicFileList, loadSingleTrack]);

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
        
        // Initialize music tracks (lazy load)
        console.log('Initializing music tracks...');
        const tracks = await initializeMusicTracks(audioContext);
        
        if (!mounted) return;
        
        if (tracks.length === 0) {
          console.error('No music tracks initialized');
          return;
        }
        
        tracksRef.current = tracks;
        
        // Create song info list for UI
        const songs: SongInfo[] = tracks.map((track: AudioTrack, index: number) => ({
          id: index,
          name: track.filename.replace(/\.(mp3|wav|ogg)$/i, '').replace(/[-_]/g, ' '),
          filename: track.filename,
        }));
        setAvailableSongs(songs);
        
        // Create initial shuffled playlist
        playlistRef.current = shufflePlaylist(tracks.length);
        playlistPositionRef.current = 0;
        
        // Set initial current song
        if (songs.length > 0) {
          setCurrentSong(songs[playlistRef.current[0]]);
        }
        
        console.log(`Loaded ${tracks.length} tracks`);
        
        // Set ready state first
        setIsReady(true);

        // Auto-play if requested - wait a bit longer to ensure state is updated
        if (autoPlay && mounted) {
          setTimeout(() => {
            if (mounted) {
              console.log('Auto-starting music...');
              start();
            }
          }, 200);
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
      console.log(`Cleaning up music hook for theme: ${themeId}`);
      
      // Stop playback
      setIsPlaying(false);
      setIsReady(false);
      
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
      
      if (analyserNodeRef.current) {
        analyserNodeRef.current.disconnect();
        analyserNodeRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => {
          console.error('Error closing audio context:', err);
        });
        audioContextRef.current = null;
      }
      
      // Clear tracks
      tracksRef.current = [];
    };
  }, [themeId, initializeMusicTracks, autoPlay]); // Re-initialize when theme changes

  /**
   * Play a track on the specified source with crossfade (with lazy loading)
   */
  const playTrackOnSource = useCallback(async (
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

    // Use manual song index if set, otherwise use playlist position
    const trackIndex = manualSongIndexRef.current !== null
      ? manualSongIndexRef.current
      : playlist[playlistPosition];
    const track = tracks[trackIndex];
    
    // Lazy load track if not loaded yet
    if (!track.buffer && !track.isLoading) {
      console.log(`Lazy loading track: ${track.filename}`);
      track.isLoading = true;
      const buffer = await loadSingleTrack(track.filename, audioContext);
      track.buffer = buffer;
      track.isLoading = false;
      
      if (!buffer) {
        console.error(`Failed to load track: ${track.filename}`);
        return;
      }
    }
    
    // Wait if track is currently loading
    if (track.isLoading) {
      console.log(`Waiting for track to load: ${track.filename}`);
      // Try again in a moment
      setTimeout(() => playTrackOnSource(playlistPosition, source, fadeIn), 100);
      return;
    }
    
    // Check if buffer is available
    if (!track.buffer) {
      console.error(`Track buffer not available: ${track.filename}`);
      return;
    }
    
    // Update current song state
    setCurrentSong({
      id: trackIndex,
      name: track.filename.replace(/\.(mp3|wav|ogg)$/i, '').replace(/[-_]/g, ' '),
      filename: track.filename,
    });
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
      // Only auto-advance if not in manual mode
      const shouldAutoAdvance = manualSongIndexRef.current === null;
      
      let nextPlaylistPosition = playlistPosition;
      let actualNextPosition = playlistPosition;
      
      if (shouldAutoAdvance) {
        nextPlaylistPosition = playlistPosition + 1;
        
        // Check if we need to reshuffle (reached end of playlist)
        actualNextPosition = nextPlaylistPosition;
        if (nextPlaylistPosition >= playlist.length) {
          // Reshuffle for next round
          console.log('End of playlist reached, reshuffling...');
          playlistRef.current = shufflePlaylist(tracks.length);
          actualNextPosition = 0;
        }
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
        
        // If in manual mode, just loop the same track
        if (manualSongIndexRef.current !== null) {
          console.log(`Manual mode: looping track ${manualSongIndexRef.current}`);
          actualNextPosition = playlistPosition; // Stay on same track
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
        
        const nextTrackIndex = manualSongIndexRef.current !== null
          ? manualSongIndexRef.current
          : playlistRef.current[actualNextPosition];
        
        // Defensive check: ensure track exists before accessing properties
        if (nextTrackIndex !== undefined && tracks[nextTrackIndex]) {
          console.log(`Crossfading to: ${tracks[nextTrackIndex].filename}`);
        } else {
          console.error('[Background Music] Invalid track index during crossfade:', nextTrackIndex);
        }
      }, crossfadeStartTime * 1000);

      // Start playback
      bufferSource.start(0);
      sourceRef.current = bufferSource;
      
      console.log(`Playing on source ${source}: ${track.filename}`);
    } catch (error) {
      console.error(`Failed to play track on source ${source}:`, error);
    }
  }, [CROSSFADE_DURATION, loadSingleTrack, shufflePlaylist]);

  /**
   * Start playing the background music
   */
  const start = useCallback(() => {
    const audioContext = audioContextRef.current;
    const tracks = tracksRef.current;
    
    // Check refs directly instead of state to avoid stale closure issues
    if (!audioContext || !tracks || tracks.length === 0) {
      console.warn('Background music not ready - missing audio context or tracks');
      return;
    }
    
    // Check if first track is loaded
    if (!tracks[0] || !tracks[0].buffer) {
      console.warn('Background music not ready - first track not loaded');
      return;
    }

    // Don't start if already playing
    if (isPlaying) {
      console.log('Music already playing');
      return;
    }

    try {
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
  }, [isPlaying, playTrackOnSource]);

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

  /**
   * Set the current song (manual selection or auto-cycle)
   * @param songId - Song index to play, or null for auto-cycle mode
   */
  const setSong = useCallback((songId: number | null) => {
    const tracks = tracksRef.current;
    
    if (!isReady || tracks.length === 0) {
      console.warn('[MP3 Music] Not ready or no tracks available');
      return;
    }

    if (songId === null) {
      // Switch to auto-cycle mode
      console.log('[MP3 Music] Switching to AUTO-CYCLE mode');
      manualSongIndexRef.current = null;
      setIsAutoCycling(true);
      
      // If playing, trigger crossfade to next track in playlist
      if (isPlaying) {
        const currentSource = activeSourceRef.current;
        const nextSource = currentSource === 'A' ? 'B' : 'A';
        const nextPosition = (playlistPositionRef.current + 1) % playlistRef.current.length;
        
        // Fade out current
        const currentGainNode = currentSource === 'A' ? gainARef.current : gainBRef.current;
        const audioContext = audioContextRef.current;
        if (currentGainNode && audioContext) {
          const fadeStartTime = audioContext.currentTime;
          currentGainNode.gain.cancelScheduledValues(fadeStartTime);
          currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, fadeStartTime);
          currentGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + CROSSFADE_DURATION);
        }
        
        // Play next track
        activeSourceRef.current = nextSource;
        playlistPositionRef.current = nextPosition;
        playTrackOnSource(nextPosition, nextSource, true);
      }
    } else {
      // Switch to manual mode with specific song
      if (songId < 0 || songId >= tracks.length) {
        console.warn(`[MP3 Music] Invalid song index: ${songId}`);
        return;
      }
      
      const song = availableSongs[songId];
      console.log(`[MP3 Music] Switching to MANUAL mode, song: "${song.name}"`);
      manualSongIndexRef.current = songId;
      setIsAutoCycling(false);
      setCurrentSong(song);
      
      // If playing, trigger crossfade to selected track
      if (isPlaying) {
        const currentSource = activeSourceRef.current;
        const nextSource = currentSource === 'A' ? 'B' : 'A';
        
        // Fade out current
        const currentGainNode = currentSource === 'A' ? gainARef.current : gainBRef.current;
        const audioContext = audioContextRef.current;
        if (currentGainNode && audioContext) {
          const fadeStartTime = audioContext.currentTime;
          currentGainNode.gain.cancelScheduledValues(fadeStartTime);
          currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, fadeStartTime);
          currentGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + CROSSFADE_DURATION);
        }
        
        // Play selected track
        activeSourceRef.current = nextSource;
        playTrackOnSource(playlistPositionRef.current, nextSource, true);
      }
    }
  }, [isReady, isPlaying, availableSongs, playTrackOnSource, CROSSFADE_DURATION]);

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
    currentSong,
    availableSongs,
    isAutoCycling,
    setSong,
  };
}

// Made with Bob