/**
 * Shared style constants for consistent styling across components
 * These constants help eliminate duplicate CSS class combinations
 */

/**
 * Card style variants for pixel-themed cards
 */
export const CARD_STYLES = {
  /** Base card style with pixel border */
  base: 'p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border',
  
  /** Card with glow effect on hover */
  glow: 'p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border hover:border-[var(--color-secondary)] transition-colors glitch-hover',
  
  /** Card with gradient background */
  gradient: 'p-6 bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-card)] border-2 border-[var(--color-primary)]/40 rounded-lg pixel-border',
  
  /** Card with scanline effect */
  scanline: 'p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border scanline-container',
} as const;

/**
 * Table style constants for consistent table styling
 */
export const TABLE_STYLES = {
  /** Table container wrapper */
  container: 'w-full p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border scanline-container',
  
  /** Table header row */
  header: 'border-b-2 border-[var(--color-primary)]',
  
  /** Table header cell */
  headerCell: 'px-4 py-3 text-left font-pixel text-xs text-[var(--color-primary)]',
  
  /** Table body row */
  row: 'border-b border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-card)] transition-colors',
  
  /** Table body cell */
  cell: 'px-4 py-3 font-pixel text-xs text-white',
  
  /** Overflow container for responsive tables */
  overflow: 'overflow-x-auto',
  
  /** Full table element */
  table: 'w-full border-collapse',
} as const;

/**
 * Text style constants for consistent typography
 */
export const TEXT_STYLES = {
  /** Primary heading with glow effect */
  heading: 'text-lg font-pixel text-[var(--color-primary)] mb-4 glow-text-subtle',
  
  /** Small uppercase label */
  label: 'text-xs font-pixel text-[var(--color-primary)] uppercase',
  
  /** Large value display */
  value: 'text-2xl font-pixel text-white glitch-hover',
  
  /** Small secondary text */
  subtitle: 'text-xs font-pixel text-gray-400',
} as const;

/**
 * Chart container style constants
 */
export const CHART_STYLES = {
  /** Standard chart container */
  container: 'w-full h-[400px] p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border',
  
  /** Compact chart container */
  compact: 'w-full h-[300px] p-4 bg-[var(--color-bg-dark)] border-2 border-[var(--color-primary)] rounded-lg pixel-border',
} as const;

// Made with Bob
