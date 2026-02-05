'use client';

import { SongInfo } from '@/hooks/useBackgroundMusic';

interface SongSelectorProps {
  currentSong: SongInfo | null;
  availableSongs: SongInfo[];
  isAutoCycling: boolean;
  onSongChange: (songId: number | null) => void;
  className?: string;
}

/**
 * Component to navigate between different songs
 * Simple next/previous controls with current song display
 * Works with both MP3 and procedurally generated music
 */
export function SongSelector({
  currentSong,
  availableSongs,
  isAutoCycling,
  onSongChange,
  className = '',
}: SongSelectorProps) {
  // Don't render if no songs available
  if (availableSongs.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (!currentSong) {
      return;
    }
    const prevId = (currentSong.id - 1 + availableSongs.length) % availableSongs.length;
    onSongChange(prevId);
  };

  const handleNext = () => {
    if (!currentSong) {
      return;
    }
    const nextId = (currentSong.id + 1) % availableSongs.length;
    onSongChange(nextId);
  };

  const toggleAuto = () => {
    if (isAutoCycling) {
      // Switch to manual mode with current song
      const songId = currentSong?.id ?? 0;
      onSongChange(songId);
    } else {
      // Switch to auto mode
      onSongChange(null);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={isAutoCycling}
        className="flex-1 px-1.5 py-0.5 text-[10px] font-pixel bg-black/30 border border-gray-600 text-gray-400 hover:bg-black/50 hover:text-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed pixel-border"
        title={currentSong ? `Previous song (current: ${currentSong.name})` : 'Previous song'}
      >
        ‹‹
      </button>

      {/* Auto toggle */}
      <button
        onClick={toggleAuto}
        className={`flex-1 px-3 py-0.5 text-[10px] font-pixel transition-all pixel-border ${
          isAutoCycling
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
            : 'bg-black/30 border-gray-600 text-gray-400 hover:bg-black/50'
        }`}
        title={isAutoCycling ? `Auto-cycling (current: ${currentSong?.name || 'N/A'})` : `Manual mode (${currentSong?.name || 'N/A'})`}
      >
        <span className="flex items-center justify-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 ${isAutoCycling ? 'bg-cyan-300 shadow-[0_0_4px_#67e8f9]' : 'bg-gray-500'}`} style={{ imageRendering: 'pixelated' }} />
          <span>{isAutoCycling ? 'AUTO' : 'MANUAL'}</span>
        </span>
      </button>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={isAutoCycling}
        className="flex-1 px-1.5 py-0.5 text-[10px] font-pixel bg-black/30 border border-gray-600 text-gray-400 hover:bg-black/50 hover:text-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed pixel-border"
        title={currentSong ? `Next song (current: ${currentSong.name})` : 'Next song'}
      >
        ››
      </button>
    </div>
  );
}

// Made with Bob