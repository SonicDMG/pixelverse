'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllThemes } from '@/constants/theme';

/**
 * AppSwitcher Component
 * Dynamically generates theme switcher buttons from the theme registry
 * Automatically supports any number of themes without code changes
 * Uses URL query parameter (?app=themeId)
 */
export default function AppSwitcher() {
  const router = useRouter();
  const { appMode } = useTheme();
  const themes = getAllThemes();

  const switchApp = (themeId: string) => {
    router.push(`?app=${themeId}`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end">
      {themes.map((theme, index) => (
        <div key={theme.id} className="flex gap-2 items-center">
          <button
            onClick={() => switchApp(theme.id)}
            className={`px-3 sm:px-4 py-2 border-2 text-xs font-pixel transition-all pixel-border min-w-[80px] sm:min-w-[100px] ${
              appMode === theme.id
                ? 'text-[var(--color-bg-dark)]'
                : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500 hover:border-gray-500'
            }`}
            style={appMode === theme.id ? {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
              boxShadow: `0 0 10px ${theme.colors.primary}`,
            } : undefined}
            title={`Switch to ${theme.name}`}
          >
            {theme.icon} {theme.id.toUpperCase()}
          </button>
          {index < themes.length - 1 && (
            <span className="text-gray-600 font-pixel text-xs hidden sm:inline">|</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Made with Bob