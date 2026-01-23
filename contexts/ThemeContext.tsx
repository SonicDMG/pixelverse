'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ThemeConfig,
  getTheme,
  getAllThemes,
  isValidThemeId,
  DEFAULT_THEME_ID
} from '@/constants/theme';

/**
 * Theme context type supporting dynamic themes from the registry.
 *
 * The theme system now uses a registry-based approach where themes can be
 * dynamically registered and retrieved. This allows for extensibility without
 * modifying core context code.
 */
type ThemeContextType = {
  /** Current theme ID (e.g., 'ticker', 'space') */
  appMode: string;
  /** Full theme configuration object from the registry */
  theme: ThemeConfig;
  /** Set the active theme by ID. Only accepts valid registered theme IDs. */
  setAppMode: (mode: string) => void;
  /** Array of all available themes in the registry */
  availableThemes: ThemeConfig[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages dynamic theme state.
 *
 * Features:
 * - Reads theme from URL query parameter (?app=themeId)
 * - Validates theme IDs against the registry
 * - Falls back to DEFAULT_THEME_ID for invalid themes
 * - Exposes all available themes for UI components
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [appMode, setAppModeState] = useState<string>(DEFAULT_THEME_ID);

  // Get all available themes from the registry
  const availableThemes = getAllThemes();

  useEffect(() => {
    const app = searchParams.get('app');
    if (app && isValidThemeId(app)) {
      setAppModeState(app);
    } else if (app) {
      // Invalid theme ID in URL, fallback to default
      console.warn(`Invalid theme ID "${app}" in URL. Falling back to "${DEFAULT_THEME_ID}".`);
      setAppModeState(DEFAULT_THEME_ID);
    }
  }, [searchParams]);

  /**
   * Set the active theme by ID.
   * Only accepts valid theme IDs registered in the theme registry.
   * Falls back to DEFAULT_THEME_ID if an invalid ID is provided.
   */
  const setAppMode = (mode: string) => {
    if (isValidThemeId(mode)) {
      setAppModeState(mode);
    } else {
      console.warn(`Invalid theme ID "${mode}". Falling back to "${DEFAULT_THEME_ID}".`);
      setAppModeState(DEFAULT_THEME_ID);
    }
  };

  // Get the current theme object from the registry
  // Fallback to default theme if the current appMode is somehow invalid
  const theme = getTheme(appMode) || getTheme(DEFAULT_THEME_ID)!;

  return (
    <ThemeContext.Provider value={{ appMode, theme, setAppMode, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme context.
 *
 * @throws {Error} If used outside of a ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, appMode, setAppMode, availableThemes } = useTheme();
 *   return <div style={{ background: theme.colors.background }}>...</div>;
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Made with Bob