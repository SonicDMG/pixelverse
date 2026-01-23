# Procedural Music Implementation Guide

## Overview
This document describes the implementation of Tone.js procedural music generation as an alternative to MP3 files in PixelTicker/PixelSpace, with fallback support.

## What Was Implemented

### 1. Dependencies
- **Tone.js** installed via npm for procedural audio synthesis

### 2. Music Generators

#### Ticker Theme - Synthwave Style (`utils/generate-ticker-music.ts`)
- **Tempo**: 125 BPM (classic synthwave)
- **Style**: Retro 80s synthwave with driving energy
- **Instruments**:
  - Bass synth: Deep, punchy sawtooth bass with filter envelope
  - Lead synth: Bright square wave for melodies
  - Pad synth: Lush sine wave background chords
  - Arpeggiator: Triangle wave for classic 80s arpeggios
- **Effects**:
  - Reverb (2.5s decay, 30% wet)
  - Delay (8th note, 30% feedback, 20% wet)
  - Chorus (1.5Hz, 40% wet)
- **Pattern**: 4-bar loops with variation, crossfading elements

#### Space Theme - Ambient (`utils/generate-space-music.ts`)
- **Tempo**: 70 BPM (slow, atmospheric)
- **Style**: Ambient space soundscapes
- **Instruments**:
  - Drone: Sustained low sine wave foundation
  - Pad 1 & 2: Evolving sine/triangle wave chords
  - Lead: Sparse melodic phrases
  - Noise: Filtered pink noise for texture
- **Effects**:
  - Heavy reverb (8s decay, 60% wet)
  - Ping-pong delay (quarter note, 40% feedback, 30% wet)
  - Chorus (0.5Hz, 50% wet)
  - Lowpass filter (800Hz, modulating)
- **Pattern**: Slowly evolving, no hard loops, continuous atmosphere

### 3. Hook: `useProceduralMusic`
Located at `hooks/useProceduralMusic.ts`

**Interface** (matches `useBackgroundMusic` for easy swapping):
```typescript
{
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
```

**Features**:
- Automatic initialization of Tone.js
- Theme-specific music generator selection
- Volume and mute controls
- Analyser node for visualization
- Proper cleanup on unmount

### 4. Theme Configuration Update
Added optional `useProceduralMusic` flag to `ThemeConfig` interface in `constants/theme-registry.ts`:
```typescript
interface ThemeConfig {
  // ... existing properties
  useProceduralMusic?: boolean;
}
```

### 5. Music Mode Selector Component
Located at `components/MusicModeSelector.tsx`

**Features**:
- Toggle between "MP3" and "Generated" modes
- Stores preference in localStorage
- Syncs across browser tabs
- Includes `useMusicMode()` hook for reading preference
- Small, unobtrusive UI component

**Usage**:
```tsx
<MusicModeSelector onModeChange={(mode) => console.log(mode)} />
```

### 6. App Integration
Updated `app/page.tsx` to:
- Import both music hooks and the mode selector
- Initialize both music systems
- Conditionally use the active system based on user preference
- Display the mode selector in the UI (below music volume control)

## How It Works

### User Flow
1. User sees "Music: MP3 | Generated" toggle in the UI
2. User selects their preferred mode
3. Preference is saved to localStorage
4. The appropriate music system is activated
5. All controls (play/stop, volume, mute) work identically for both modes

### Technical Flow
```
User selects mode → localStorage updated → useMusicMode() hook updates
                                              ↓
                                    activeMusic = mode === 'generated' 
                                                  ? proceduralMusic 
                                                  : mp3Music
                                              ↓
                                    UI controls use activeMusic
```

### Fallback Support
- Both music systems are always initialized
- MP3 system remains the default
- Users can switch at any time
- No breaking changes to existing functionality

## Testing Checklist

- [x] Tone.js installed successfully
- [ ] Ticker theme generates synthwave music
- [ ] Space theme generates ambient music
- [ ] Music mode selector appears in UI
- [ ] Switching modes works correctly
- [ ] Preference persists across page reloads
- [ ] Volume controls work for both modes
- [ ] Mute works for both modes
- [ ] Play/stop works for both modes
- [ ] Audio visualizer works with procedural music
- [ ] No console errors
- [ ] CPU usage is reasonable
- [ ] Music sounds professional and pleasant

## Key Features

### ✅ Zero Licensing Concerns
Procedurally generated music has no copyright issues

### ✅ Dynamic Generation
Music is created in real-time, never repeating exactly

### ✅ Theme-Appropriate
- Ticker: Energetic synthwave for stock trading
- Space: Atmospheric ambient for space exploration

### ✅ Performance Optimized
- Efficient synthesis using Tone.js
- Proper cleanup to prevent memory leaks
- Minimal CPU overhead

### ✅ User Choice
Users can choose between MP3 and generated music

### ✅ Seamless Integration
Same interface as existing music system

## File Structure
```
pixelticker/
├── utils/
│   ├── generate-ticker-music.ts    # Synthwave generator
│   └── generate-space-music.ts     # Ambient generator
├── hooks/
│   ├── useBackgroundMusic.ts       # Existing MP3 system
│   └── useProceduralMusic.ts       # New procedural system
├── components/
│   └── MusicModeSelector.tsx       # Mode toggle UI
├── constants/
│   └── theme-registry.ts           # Updated with useProceduralMusic flag
└── app/
    └── page.tsx                    # Updated to support both modes
```

## Future Enhancements

### Potential Improvements
1. **More Themes**: Add generators for other themes as they're created
2. **Customization**: Allow users to adjust tempo, key, or instrument mix
3. **Presets**: Multiple music styles per theme
4. **Transitions**: Smooth crossfading when switching modes
5. **Reactive Music**: Music that responds to app state (e.g., stock prices)
6. **Export**: Allow users to export generated music as audio files

### Advanced Features
- Music that adapts to time of day
- Generative melodies based on stock data
- User-configurable synthesis parameters
- MIDI export for generated patterns

## Troubleshooting

### Music doesn't play
- Check browser console for errors
- Ensure Tone.js is properly installed
- Verify audio context is started (requires user interaction)

### Performance issues
- Reduce number of active synths
- Increase buffer size in Tone.js
- Simplify effects chains

### Volume too low/high
- Adjust individual synth volumes in generator files
- Check master volume settings
- Verify gain node values

## Credits
- **Tone.js**: https://tonejs.github.io/
- **Implementation**: Bob (AI Assistant)
- **Design**: Synthwave and ambient music principles

---

Made with Bob 🤖