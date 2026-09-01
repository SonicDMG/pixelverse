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
export function AppSwitcher() {
  const router = useRouter();
  const { appMode } = useTheme();
  const themes = getAllThemes();

  const switchApp = (themeId: string) => {
    router.push(`?app=${themeId}`);
  };

  const renderButton = (themeId: string, fullWidth = false) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return null;
    const active = appMode === theme.id;
    return (
      <button
        key={theme.id}
        onClick={() => switchApp(theme.id)}
        className={`px-3 sm:px-4 py-2 border-2 text-xs font-pixel transition-all pixel-border ${fullWidth ? 'w-full' : 'min-w-[80px] sm:min-w-[100px]'} ${
          active
            ? 'text-[var(--color-bg-dark)]'
            : 'bg-[var(--color-bg-dark)] border-gray-600 text-gray-500 hover:border-gray-500'
        }`}
        style={active ? {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          boxShadow: `0 0 10px ${theme.colors.primary}`,
        } : undefined}
        title={`Switch to ${theme.name}`}
      >
        {theme.icon} {theme.id.toUpperCase()}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2 items-center lg:items-end">
      {/* Row 1: ticker | space */}
      <div className="flex gap-2 items-center">
        {renderButton('ticker')}
        <span className="text-gray-600 font-pixel text-xs hidden sm:inline">|</span>
        {renderButton('space')}
      </div>
      {/* Row 2: generalist — stretches to match width of row 1 */}
      <div className="flex w-full">
        {renderButton('generalist', true)}
      </div>
    </div>
  );
}

// Made with Bob