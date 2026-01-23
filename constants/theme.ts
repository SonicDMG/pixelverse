/**
 * Theme constants for PixelTicker and PixelSpace
 * 
 * This file maintains backward compatibility with existing code while using
 * the new centralized theme registry system from theme-registry.ts
 * 
 * All theme definitions now live in theme-registry.ts as the single source of truth.
 * This file re-exports everything needed for backward compatibility.
 */

// Import from the new theme registry
import {
  ThemeConfig,
  THEME_REGISTRY,
  DEFAULT_THEME_ID,
  getTheme,
  getAllThemes,
  getThemeIds,
  isValidThemeId,
} from './theme-registry';

// Re-export the ThemeConfig type
export type { ThemeConfig };

// Re-export all helper functions
export { getTheme, getAllThemes, getThemeIds, isValidThemeId, DEFAULT_THEME_ID };

// Re-export the registry itself
export { THEME_REGISTRY };

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Dynamic AppMode type based on registry keys
 * This makes it automatically update when new themes are added to the registry
 */
export type AppMode = keyof typeof THEME_REGISTRY;

/**
 * Individual theme exports for backward compatibility
 */
export const TICKER_THEME = THEME_REGISTRY.ticker;
export const SPACE_THEME = THEME_REGISTRY.space;

/**
 * THEMES object for backward compatibility
 * This is just an alias to THEME_REGISTRY
 */
export const THEMES = THEME_REGISTRY;

/**
 * Default theme (for backwards compatibility)
 * Uses the space theme as the default
 */
export const THEME = SPACE_THEME;

/**
 * Export individual values for convenience
 * These provide direct access to the default theme's properties
 */
export const COLORS = THEME.colors;
export const FONTS = THEME.fonts;
export const ANIMATIONS = THEME.animations;
export const AUDIO = THEME.audio;

// Made with Bob