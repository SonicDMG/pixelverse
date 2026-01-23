'use client';

import { useState, useEffect } from 'react';

type MusicMode = 'mp3' | 'generated';

interface MusicModeSelectorProps {
  onModeChange?: (mode: MusicMode) => void;
  className?: string;
}

const STORAGE_KEY = 'pixelticker-music-mode';
const MUSIC_MODE_CHANGE_EVENT = 'pixelticker-music-mode-change';

/**
 * Component to toggle between MP3 and procedurally generated music
 * Stores user preference in localStorage
 */
export function MusicModeSelector({ onModeChange, className = '' }: MusicModeSelectorProps) {
  const [mode, setMode] = useState<MusicMode>('mp3');
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as MusicMode | null;
    console.log('[MusicModeSelector] Initial load from localStorage:', stored);
    if (stored === 'mp3' || stored === 'generated') {
      setMode(stored);
    }
  }, []);

  // Save preference and notify parent
  const handleModeChange = (newMode: MusicMode) => {
    console.log('[MusicModeSelector] Mode changed to:', newMode);
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    
    // Dispatch custom event for same-tab communication
    window.dispatchEvent(new CustomEvent(MUSIC_MODE_CHANGE_EVENT, { detail: newMode }));
    
    onModeChange?.(newMode);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => handleModeChange(mode === 'mp3' ? 'generated' : 'mp3')}
      className={`flex items-center gap-1 px-1 py-0.5 bg-black/30 rounded hover:bg-black/50 transition-all ${className}`}
      title={`Switch to ${mode === 'mp3' ? 'procedurally generated' : 'MP3'} music`}
    >
      <span className="text-[10px] opacity-70">
        {mode === 'mp3' ? '○ MP3' : '● Generated'}
      </span>
    </button>
  );
}

/**
 * Hook to get the current music mode preference
 * Returns 'mp3' by default if no preference is stored
 * Listens for changes from both same-tab and cross-tab updates
 */
export function useMusicMode(): MusicMode {
  const [mode, setMode] = useState<MusicMode>('mp3');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Read initial value from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as MusicMode | null;
    console.log('[useMusicMode] Initial load from localStorage:', stored);
    if (stored === 'mp3' || stored === 'generated') {
      setMode(stored);
      console.log('[useMusicMode] Mode set to:', stored);
    }

    // Listen for custom event (same-tab changes)
    const handleMusicModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<MusicMode>;
      const newMode = customEvent.detail;
      console.log('[useMusicMode] Custom event received, new mode:', newMode);
      if (newMode === 'mp3' || newMode === 'generated') {
        setMode(newMode);
      }
    };

    // Listen for storage changes (cross-tab changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'mp3' || e.newValue === 'generated')) {
        console.log('[useMusicMode] Storage event received, new mode:', e.newValue);
        setMode(e.newValue);
      }
    };

    window.addEventListener(MUSIC_MODE_CHANGE_EVENT, handleMusicModeChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(MUSIC_MODE_CHANGE_EVENT, handleMusicModeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Log current mode whenever it changes
  useEffect(() => {
    if (mounted) {
      console.log('[useMusicMode] Current mode:', mode);
    }
  }, [mode, mounted]);

  return mounted ? mode : 'mp3';
}

// Made with Bob
