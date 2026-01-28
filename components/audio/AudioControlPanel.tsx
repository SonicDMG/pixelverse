'use client';

import { ThemeConfig } from '@/constants/theme';
import AudioVisualizer from '@/components/AudioVisualizer';
import { SongSelector } from '@/components/SongSelector';
import { SongInfo } from '@/hooks/useBackgroundMusic';

/**
 * AudioControlPanel Component
 * 
 * Unified panel for all audio controls including music playback, voice synthesis,
 * volume controls, song selection, and audio visualization.
 * 
 * Displays differently on mobile (stacked) vs desktop (side-by-side).
 */
interface AudioControlPanelProps {
  // Music controls
  isMusicPlaying: boolean;
  isMusicReady: boolean;
  musicVolume: number;
  currentSong: SongInfo | null;
  availableSongs: SongInfo[];
  isAutoCycling: boolean;
  analyserNode: AnalyserNode | null;
  onToggleMusic: () => void;
  onSetMusicVolume: (volume: number) => void;
  onSetSong: (songId: number | null) => void;
  
  // Voice controls
  isVoiceSupported: boolean;
  isVoiceEnabled: boolean;
  voiceVolume: number;
  onToggleVoice: () => void;
  onSetVoiceVolume: (volume: number) => void;
  
  // Shared
  isMounted: boolean;
  theme: ThemeConfig;
  className?: string;
}

export function AudioControlPanel({
  isMusicPlaying,
  isMusicReady,
  musicVolume,
  currentSong,
  availableSongs,
  isAutoCycling,
  analyserNode,
  onToggleMusic,
  onSetMusicVolume,
  onSetSong,
  isVoiceSupported,
  isVoiceEnabled,
  voiceVolume,
  onToggleVoice,
  onSetVoiceVolume,
  isMounted,
  theme,
  className = '',
}: AudioControlPanelProps) {
  return (
    <>
      {/* Mobile Layout: Stacked vertically (below lg breakpoint) */}
      <div className={`flex flex-col gap-4 lg:hidden ${className}`}>
        {/* Music and Voice Buttons - Side by Side */}
        <div className="flex gap-2 px-4">
          {/* Music Button */}
          <button
            onClick={onToggleMusic}
            disabled={!isMusicReady}
            className={`flex-1 px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
              isMusicPlaying
                ? 'bg-[var(--color-bg-dark)] border-[var(--color-success)] text-[var(--color-success)]'
                : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isMusicPlaying ? "Stop background music" : "Play background music"}
          >
            🎵 MUSIC
          </button>

          {/* Voice Button */}
          {isMounted && (
            <button
              onClick={onToggleVoice}
              disabled={!isVoiceSupported}
              className={`flex-1 px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                isVoiceEnabled
                  ? 'bg-[var(--color-bg-dark)] border-[var(--color-success)] text-[var(--color-success)]'
                  : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isVoiceEnabled ? "Disable voice announcements" : "Enable voice announcements"}
            >
              🗣️ VOICE
            </button>
          )}
        </div>

        {/* Volume Controls - Side by Side under respective buttons */}
        <div className="flex gap-2 px-4">
          {/* Music Volume Control */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] font-pixel flex-shrink-0" style={{ color: theme.colors.primary }}>VOL</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(musicVolume * 100)}
              onChange={(e) => onSetMusicVolume(parseInt(e.target.value) / 100)}
              disabled={!isMusicReady}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                [&::-webkit-slider-thumb]:rounded-full
                [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-0"
              style={{
                ['--thumb-color' as any]: theme.colors.primary,
              }}
              title={`Music volume: ${Math.round(musicVolume * 100)}%`}
            />
            <span className="text-[10px] font-pixel w-6 text-right flex-shrink-0" style={{ color: theme.colors.primary }}>
              {Math.round(musicVolume * 100)}
            </span>
          </div>

          {/* Voice Volume Control */}
          {isMounted && (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-pixel flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(voiceVolume * 100)}
                onChange={(e) => onSetVoiceVolume(parseInt(e.target.value) / 100)}
                disabled={!isVoiceSupported}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-0"
                title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
              />
              <span className="text-[10px] font-pixel w-6 text-right flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>
                {Math.round(voiceVolume * 100)}
              </span>
            </div>
          )}
        </div>

        {/* Song Selector - Full Width */}
        {availableSongs.length > 0 && (
          <div className="w-full">
            <SongSelector
              currentSong={currentSong}
              availableSongs={availableSongs}
              isAutoCycling={isAutoCycling}
              onSongChange={onSetSong}
              className="w-full"
            />
          </div>
        )}

        {/* Audio Visualizer - Full Width */}
        <div className="w-full px-4">
          <AudioVisualizer
            analyserNode={analyserNode}
            isPlaying={isMusicPlaying}
            height={40}
          />
        </div>
      </div>

      {/* Desktop Layout: Compact side panel (lg breakpoint and above) */}
      <div className={`hidden lg:flex lg:flex-col lg:gap-4 lg:max-w-[240px] ${className}`}>
        {/* Audio Buttons - Side by Side */}
        <div className="flex gap-2">
          {/* Music Button with Volume */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <button
              onClick={onToggleMusic}
              disabled={!isMusicReady}
              className={`w-full px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                isMusicPlaying
                  ? 'bg-[var(--color-bg-dark)] border-[var(--color-success)] text-[var(--color-success)]'
                  : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isMusicPlaying ? "Stop background music" : "Play background music"}
            >
              🎵 MUSIC
            </button>
            {/* Music Volume directly under button */}
            <div className="flex items-center gap-1 w-full">
              <span className="text-[10px] font-pixel opacity-60 flex-shrink-0" style={{ color: theme.colors.primary }}>VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(musicVolume * 100)}
                onChange={(e) => onSetMusicVolume(parseInt(e.target.value) / 100)}
                disabled={!isMusicReady}
                className="flex-1 min-w-0 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-0"
                style={{
                  ['--thumb-color' as any]: theme.colors.primary,
                }}
                title={`Music volume: ${Math.round(musicVolume * 100)}%`}
              />
              <span className="text-[10px] font-pixel opacity-60 w-6 text-right flex-shrink-0" style={{ color: theme.colors.primary }}>
                {Math.round(musicVolume * 100)}
              </span>
            </div>
          </div>

          {/* Voice Button with Volume */}
          {isMounted && (
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <button
                onClick={onToggleVoice}
                disabled={!isVoiceSupported}
                className={`w-full px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                  isVoiceEnabled
                    ? 'bg-[var(--color-bg-dark)] border-[var(--color-success)] text-[var(--color-success)]'
                    : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isVoiceEnabled ? "Disable voice announcements" : "Enable voice announcements"}
              >
                🗣️ VOICE
              </button>
              {/* Voice Volume directly under button */}
              <div className="flex items-center gap-1 w-full">
                <span className="text-[10px] font-pixel opacity-60 flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>VOL</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(voiceVolume * 100)}
                  onChange={(e) => onSetVoiceVolume(parseInt(e.target.value) / 100)}
                  disabled={!isVoiceSupported}
                  className="flex-1 min-w-0 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-0"
                  title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
                />
                <span className="text-[10px] font-pixel opacity-60 w-6 text-right flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>
                  {Math.round(voiceVolume * 100)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Song Selector - Under music volume */}
        {availableSongs.length > 0 && (
          <SongSelector
            currentSong={currentSong}
            availableSongs={availableSongs}
            isAutoCycling={isAutoCycling}
            onSongChange={onSetSong}
            className="w-full"
          />
        )}

        {/* Audio Visualizer - At the bottom */}
        <div className="w-full">
          <AudioVisualizer
            analyserNode={analyserNode}
            isPlaying={isMusicPlaying}
            height={40}
          />
        </div>
      </div>
    </>
  );
}

// Made with Bob