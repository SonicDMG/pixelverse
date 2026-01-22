/**
 * Theme constants for PixelTicker
 * Centralizes color values and theme configuration
 */

export const THEME = {
  colors: {
    neonCyan: '#00ff9f',
    neonMagenta: '#ff00ff',
    neonBlue: '#00d4ff',
    neonYellow: '#ffff00',
    darkBg: '#0a0e27',
    darkerBg: '#050814',
    cardBg: '#1a1f3a',
    error: '#ff0000',
  },
  fonts: {
    pixel: "'Press Start 2P', monospace",
  },
  animations: {
    duration: {
      fast: 200,
      normal: 500,
      slow: 1500,
    },
  },
  audio: {
    soundEffectsVolume: 0.125, // Default volume for sound effects (0.0 to 1.0)
  },
} as const;

// Export individual color values for convenience
export const COLORS = THEME.colors;
export const FONTS = THEME.fonts;
export const ANIMATIONS = THEME.animations;
export const AUDIO = THEME.audio;

// Made with Bob