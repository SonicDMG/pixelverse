/**
 * Centralized Theme Registry for PixelTicker
 * Single source of truth for all theme configurations
 * Makes it easy to add new themes in the future
 */

/**
 * Complete theme configuration interface
 */
export interface ThemeConfig {
  /** Unique theme identifier (e.g., 'ticker', 'space') */
  id: string;
  
  /** Display name for the theme (e.g., 'PixelTicker') */
  name: string;
  
  /** Subtitle/tagline text */
  tagline: string;
  
  /** API route for this theme's queries */
  apiEndpoint: string;
  
  /** Music folder name for background music */
  musicDirectory: string;
  
  /** Loading message text for data fetching state */
  loadingDataText: string;
  
  /** Optional emoji/icon for UI representation */
  icon?: string;
  
  /** Color palette configuration */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neonCyan: string;
    neonMagenta: string;
    neonBlue: string;
    neonYellow: string;
    darkBg: string;
    darkerBg: string;
    cardBg: string;
    error: string;
  };
  
  /** Font configuration */
  fonts: {
    pixel: string;
  };
  
  /** Animation timing configuration */
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
  };
  
  /** Audio configuration */
  audio: {
    soundEffectsVolume: number;
  };
  
  /** Example questions to help users get started */
  exampleQuestions: string[];
}

/**
 * Theme registry containing all available themes
 */
export const THEME_REGISTRY: Record<string, ThemeConfig> = {
  ticker: {
    id: 'ticker',
    name: 'PixelTicker',
    tagline: 'RETRO STOCK ANALYSIS POWERED BY LANGFLOW + MCP',
    apiEndpoint: '/api/ask-stock',
    musicDirectory: 'ticker',
    loadingDataText: 'STOCK DATA',
    icon: '📈',
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
    exampleQuestions: [
      'Show me AAPL stock price with metrics',
      'Compare TSLA vs NVDA performance over time',
      'Display MSFT key financial metrics in a grid',
      'Show me trading data for IBM',
      'What are the latest financial trends?',
    ],
  },
  
  space: {
    id: 'space',
    name: 'PixelSpace',
    tagline: 'RETRO SPACE EXPLORATION POWERED BY LANGFLOW + OPENRAG',
    apiEndpoint: '/api/ask-space',
    musicDirectory: 'space',
    loadingDataText: 'SPACE DATA',
    icon: '🚀',
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
    exampleQuestions: [
      'Show me the solar system',
      'Tell me about Jupiter',
      'Show me the Orion constellation',
      'What is the history of Mars exploration?',
      'Explain the pillars of creation',
    ],
  },
};

/**
 * Default theme identifier
 */
export const DEFAULT_THEME_ID = 'space';

/**
 * Get a theme configuration by ID
 * @param themeId - The unique theme identifier
 * @returns The theme configuration or undefined if not found
 */
export function getTheme(themeId: string): ThemeConfig | undefined {
  return THEME_REGISTRY[themeId];
}

/**
 * Get all available theme configurations
 * @returns Array of all theme configurations
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEME_REGISTRY);
}

/**
 * Get all available theme IDs
 * @returns Array of theme identifiers
 */
export function getThemeIds(): string[] {
  return Object.keys(THEME_REGISTRY);
}

/**
 * Check if a theme ID is valid
 * @param id - The theme identifier to validate
 * @returns True if the theme exists in the registry
 */
export function isValidThemeId(id: string): boolean {
  return id in THEME_REGISTRY;
}

// Made with Bob