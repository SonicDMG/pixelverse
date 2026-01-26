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
    tagline: 'RETRO SPACE EXPLORATION POWERED BY LANGFLOW + MCP',
    apiEndpoint: '/api/ask-space',
    musicDirectory: 'space',
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
      'Tell me about Mars',
      'What is the Moon?',
      'Show me Jupiter facts',
      'Tell me about the Sun',
      'What are the planets in our solar system?',
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

/**
 * Type guard to validate a theme configuration object
 * @param config - Partial theme configuration to validate
 * @returns True if the config is a complete valid ThemeConfig
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): config is ThemeConfig {
  if (!config) return false;
  
  // Check required string fields
  const requiredStrings: (keyof ThemeConfig)[] = [
    'id',
    'name',
    'tagline',
    'apiEndpoint',
    'musicDirectory',
  ];
  
  for (const field of requiredStrings) {
    if (typeof config[field] !== 'string' || !config[field]) {
      return false;
    }
  }
  
  // Check colors object
  if (!config.colors || typeof config.colors !== 'object') return false;
  const requiredColors = [
    'primary',
    'secondary',
    'accent',
    'neonCyan',
    'neonMagenta',
    'neonBlue',
    'neonYellow',
    'darkBg',
    'darkerBg',
    'cardBg',
    'error',
  ];
  for (const color of requiredColors) {
    if (typeof config.colors[color as keyof typeof config.colors] !== 'string') {
      return false;
    }
  }
  
  // Check fonts object
  if (!config.fonts || typeof config.fonts !== 'object') return false;
  if (typeof config.fonts.pixel !== 'string') return false;
  
  // Check animations object
  if (!config.animations || typeof config.animations !== 'object') return false;
  if (!config.animations.duration || typeof config.animations.duration !== 'object') return false;
  if (
    typeof config.animations.duration.fast !== 'number' ||
    typeof config.animations.duration.normal !== 'number' ||
    typeof config.animations.duration.slow !== 'number'
  ) {
    return false;
  }
  
  // Check audio object
  if (!config.audio || typeof config.audio !== 'object') return false;
  if (typeof config.audio.soundEffectsVolume !== 'number') return false;
  
  // Check exampleQuestions array
  if (!Array.isArray(config.exampleQuestions)) return false;
  if (!config.exampleQuestions.every((q) => typeof q === 'string')) return false;
  
  // Icon is optional, but if present must be a string
  if (config.icon !== undefined && typeof config.icon !== 'string') {
    return false;
  }
  
  return true;
}

// Made with Bob