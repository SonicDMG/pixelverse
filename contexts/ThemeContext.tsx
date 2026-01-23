'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppMode, THEMES, TICKER_THEME, SPACE_THEME } from '@/constants/theme';

type ThemeContextType = {
  appMode: AppMode;
  theme: typeof TICKER_THEME | typeof SPACE_THEME;
  setAppMode: (mode: AppMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [appMode, setAppModeState] = useState<AppMode>('space');

  useEffect(() => {
    const app = searchParams.get('app');
    if (app === 'ticker' || app === 'space') {
      setAppModeState(app);
    }
  }, [searchParams]);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
  };

  const theme = THEMES[appMode];

  return (
    <ThemeContext.Provider value={{ appMode, theme, setAppMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Made with Bob