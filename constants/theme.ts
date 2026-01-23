/**
 * Theme constants for PixelTicker and PixelSpace
 * Supports dual-app mode with different themes
 */

export type AppMode = 'ticker' | 'space';

export const TICKER_THEME = {
  colors: {
    primary: '#00ff9f',      // Neon cyan - stock ticker green
    secondary: '#00d4ff',    // Bright cyan
    accent: '#ff00ff',       // Magenta
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
    soundEffectsVolume: 0.125,
  },
  name: 'PixelTicker',
  tagline: 'RETRO STOCK ANALYSIS POWERED BY LANGFLOW + MCP',
  apiEndpoint: '/api/ask-stock',
} as const;

export const SPACE_THEME = {
  colors: {
    primary: '#4169E1',      // Royal blue - deep space
    secondary: '#00CED1',    // Dark turquoise - nebula
    accent: '#FFD700',       // Gold - stars
    neonCyan: '#00CED1',
    neonMagenta: '#9370DB',  // Medium purple - cosmic
    neonBlue: '#4169E1',
    neonYellow: '#FFD700',
    darkBg: '#0a0e1f',       // Deeper blue-black
    darkerBg: '#050a14',     // Even deeper space
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
    soundEffectsVolume: 0.125,
  },
  name: 'PixelSpace',
  tagline: 'RETRO SPACE EXPLORATION POWERED BY LANGFLOW + MCP',
  apiEndpoint: '/api/ask-space', // Future endpoint for space queries
} as const;

export const THEMES = {
  ticker: TICKER_THEME,
  space: SPACE_THEME,
} as const;

// Default theme (for backwards compatibility)
export const THEME = SPACE_THEME;

// Export individual values for convenience
export const COLORS = THEME.colors;
export const FONTS = THEME.fonts;
export const ANIMATIONS = THEME.animations;
export const AUDIO = THEME.audio;

// Made with Bob