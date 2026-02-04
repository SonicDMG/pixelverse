'use client';

import { ThemeConfig } from '@/constants/theme';
import { AppSwitcher } from '@/components/AppSwitcher';
import { UserStatus } from '@/components/UserStatus';
import { LoadingStatus } from '@/types';

/**
 * AppHeader Component
 * 
 * Main header content for the application containing:
 * - App mode switcher (TICKER/SPACE) - mobile only
 * - Application title and tagline
 * - Clear conversation button
 * 
 * On desktop, only renders center (title) and right (switcher + clear) columns.
 * The parent creates the grid and renders audio controls in the left column.
 */
interface AppHeaderProps {
  appMode: string;
  theme: ThemeConfig;
  hasConversation: boolean;
  loadingStatus: LoadingStatus;
  onClearConversation: () => void;
}

export function AppHeader({
  appMode,
  theme,
  hasConversation,
  loadingStatus,
  onClearConversation,
}: AppHeaderProps) {
  return (
    <>
      {/* Mobile Layout: Stacked vertically (below lg breakpoint) */}
      <div className="flex flex-col gap-4 lg:hidden">
        {/* App Switcher Buttons */}
        <div className="flex items-center justify-center">
          <AppSwitcher />
        </div>

        {/* Title and Tagline */}
        <div className="flex flex-col items-center text-center w-full px-2">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel glow-text leading-tight whitespace-nowrap" style={{ color: theme.colors.primary }}>
            {theme.name.toUpperCase()}
          </h1>
          <p className="text-xs md:text-sm font-pixel mt-1 break-words w-full" style={{ color: theme.colors.accent }}>
            {'>'} {theme.tagline}
          </p>
        </div>

        {/* User Status (mobile) */}
        <div className="flex justify-center">
          <UserStatus theme={theme} />
        </div>

        {/* Clear Button */}
        {hasConversation && (
          <div className="flex justify-center mb-8">
            <button
              onClick={onClearConversation}
              disabled={loadingStatus !== null && loadingStatus !== 'done'}
              className="px-4 py-2 bg-[var(--color-bg-card)] border-2 text-xs font-pixel hover:text-[var(--color-bg-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border whitespace-nowrap"
              style={{
                borderColor: theme.colors.accent,
                color: theme.colors.accent,
              }}
              title="Clear conversation history"
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Desktop Layout: Center and Right columns only (grid created by parent) */}
      <>
        {/* Center Column: Title */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:text-center lg:mx-auto">
          <h1 className="text-4xl md:text-5xl font-pixel glow-text" style={{ color: theme.colors.primary }}>
            {theme.name.toUpperCase()}
          </h1>
          <p className="text-sm md:text-base font-pixel mt-2" style={{ color: theme.colors.accent }}>
            {'>'} {theme.tagline}
          </p>
        </div>

        {/* Right Column: User Status + App Switcher + Clear Button - matches audio panel width */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-[240px] lg:justify-self-end">
          {/* User Status */}
          <div className="w-full flex justify-end">
            <UserStatus theme={theme} />
          </div>

          <div className="w-full flex justify-end">
            <AppSwitcher />
          </div>
          
          {/* Clear Button (right column on desktop, under app switcher, full width) */}
          {hasConversation && (
            <button
              onClick={onClearConversation}
              disabled={loadingStatus !== null && loadingStatus !== 'done'}
              className="w-full px-4 py-2 bg-[var(--color-bg-card)] border-2 text-xs font-pixel hover:text-[var(--color-bg-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border whitespace-nowrap"
              style={{
                borderColor: theme.colors.accent,
                color: theme.colors.accent,
              }}
              title="Clear conversation history"
            >
              CLEAR
            </button>
          )}
        </div>
      </>
    </>
  );
}

// Made with Bob