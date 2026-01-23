'use client';

import { SongInfo } from '@/hooks/useBackgroundMusic';

interface TrackMetadata {
  filename: string;
  title: string;
  artist: string;
  source: string;
  license: string;
  licenseUrl: string;
}

// Track metadata for all Incompetech music files
const TRACK_METADATA: TrackMetadata[] = [
  // Ticker theme tracks
  {
    filename: 'Push Thru - The Grey Room _ Golden Palms.mp3',
    title: 'Push Thru',
    artist: 'The Grey Room / Golden Palms',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    filename: 'Smooth and Cool - Nico Staf.mp3',
    title: 'Smooth and Cool',
    artist: 'Nico Staf',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    filename: 'The Fifth Quadrant - Dan _Lebo_ Lebowitz, Tone Seeker.mp3',
    title: 'The Fifth Quadrant',
    artist: 'Dan "Lebo" Lebowitz, Tone Seeker',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  // Space theme tracks
  {
    filename: 'Equatorial Complex.mp3',
    title: 'Equatorial Complex',
    artist: 'Kevin MacLeod',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    filename: 'Galactic Rap.mp3',
    title: 'Galactic Rap',
    artist: 'Kevin MacLeod',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    filename: 'Inspired.mp3',
    title: 'Inspired',
    artist: 'Kevin MacLeod',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    filename: 'Spacial Harvest.mp3',
    title: 'Spacial Harvest',
    artist: 'Kevin MacLeod',
    source: 'incompetech.com',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },
];

interface MusicAttributionProps {
  currentSong: SongInfo | null;
  isPlaying: boolean;
  className?: string;
}

/**
 * Component to display music attribution for Incompetech royalty-free music
 * Shows composer name, track title, and Creative Commons license
 * Only displays when music is playing
 */
export function MusicAttribution({
  currentSong,
  isPlaying,
  className = '',
}: MusicAttributionProps) {
  // Don't show if not playing or no current song
  if (!isPlaying || !currentSong) {
    return null;
  }

  // Find metadata for current track
  const metadata = TRACK_METADATA.find(
    (track) => track.filename === currentSong.filename
  );

  // If no metadata found, don't show attribution
  if (!metadata) {
    return null;
  }

  return (
    <div
      className={`text-[10px] font-pixel text-gray-500 opacity-70 hover:opacity-100 transition-opacity ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span>♪</span>
        <span className="text-gray-400">{metadata.title}</span>
        <span>by</span>
        <span className="text-gray-400">{metadata.artist}</span>
        <span>•</span>
        <a
          href={`https://${metadata.source}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          {metadata.source}
        </a>
        <span>•</span>
        <a
          href={metadata.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
          title="Creative Commons Attribution 4.0 International License"
        >
          {metadata.license}
        </a>
      </div>
    </div>
  );
}

// Made with Bob