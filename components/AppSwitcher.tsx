'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { TICKER_THEME, SPACE_THEME } from '@/constants/theme';

/**
 * AppSwitcher Component
 * Allows switching between PixelTicker and PixelSpace apps
 * Uses URL query parameter (?app=ticker or ?app=space)
 */
export default function AppSwitcher() {
  const router = useRouter();
  const { appMode } = useTheme();

  const switchApp = (app: 'ticker' | 'space') => {
    router.push(`?app=${app}`);
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => switchApp('ticker')}
        className={`px-3 py-2 border-2 text-xs font-pixel transition-all pixel-border ${
          appMode === 'ticker'
            ? 'text-[#0a0e27]'
            : 'bg-[#0a0e27] border-gray-600 text-gray-500'
        }`}
        style={appMode === 'ticker' ? {
          backgroundColor: TICKER_THEME.colors.primary,
          borderColor: TICKER_THEME.colors.primary,
          boxShadow: `0 0 10px ${TICKER_THEME.colors.primary}`,
        } : {}}
        title="Switch to PixelTicker (Stock Analysis)"
      >
        TICKER
      </button>
      <span className="text-gray-600 font-pixel text-xs">|</span>
      <button
        onClick={() => switchApp('space')}
        className={`px-3 py-2 border-2 text-xs font-pixel transition-all pixel-border ${
          appMode === 'space'
            ? 'text-white'
            : 'bg-[#0a0e27] border-gray-600 text-gray-500'
        }`}
        style={appMode === 'space' ? {
          backgroundColor: SPACE_THEME.colors.primary,
          borderColor: SPACE_THEME.colors.primary,
          boxShadow: `0 0 10px ${SPACE_THEME.colors.primary}`,
        } : {}}
        title="Switch to PixelSpace (Space Exploration)"
      >
        SPACE
      </button>
    </div>
  );
}

// Made with Bob