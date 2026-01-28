'use client';

import { CARD_STYLES } from '@/constants/styles';

interface PixelCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card style variant */
  variant?: 'base' | 'glow' | 'gradient' | 'scanline';
  /** Additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * PixelCard - A reusable card component with pixel-themed styling
 * 
 * Provides consistent card styling across the application with multiple variants:
 * - base: Standard pixel border card
 * - glow: Card with hover glow effect
 * - gradient: Card with gradient background
 * - scanline: Card with scanline effect
 * 
 * @example
 * ```tsx
 * <PixelCard variant="glow">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </PixelCard>
 * ```
 */
export function PixelCard({
  children,
  variant = 'base',
  className = '',
  onClick,
}: PixelCardProps) {
  const baseStyles = CARD_STYLES[variant];
  const interactiveStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * PixelCardHeader - A header component for PixelCard
 * 
 * @example
 * ```tsx
 * <PixelCard>
 *   <PixelCardHeader>Title</PixelCardHeader>
 *   <p>Content</p>
 * </PixelCard>
 * ```
 */
export function PixelCardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-pixel text-[var(--color-primary)] mb-4 glow-text-subtle ${className}`}>
      {children}
    </h3>
  );
}

/**
 * PixelCardContent - A content wrapper for PixelCard
 * 
 * @example
 * ```tsx
 * <PixelCard>
 *   <PixelCardHeader>Title</PixelCardHeader>
 *   <PixelCardContent>
 *     <p>Content goes here</p>
 *   </PixelCardContent>
 * </PixelCard>
 * ```
 */
export function PixelCardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

// Made with Bob
