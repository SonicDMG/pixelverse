'use client';

import { formatAbsolutePercentage, formatPercentage } from '@/utils/formatters';

interface ChangeIndicatorProps {
  /** The change value (percentage) */
  value?: number;
  /** Whether to show the arrow icon (default: true) */
  showIcon?: boolean;
  /** Whether to show the percentage sign (default: true) */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional label to display after the percentage */
  label?: string;
}

/**
 * ChangeIndicator - A reusable component for displaying percentage changes
 * with color-coded indicators (green for positive, red for negative)
 * 
 * @example
 * ```tsx
 * <ChangeIndicator value={5.2} />
 * <ChangeIndicator value={-3.1} showIcon={false} />
 * <ChangeIndicator value={2.5} label="vs last month" />
 * ```
 */
export function ChangeIndicator({
  value,
  showIcon = true,
  showPercentage = true,
  className = '',
  label,
}: ChangeIndicatorProps) {
  // Don't render if no value provided
  if (value === undefined) return null;

  // Determine color based on positive/negative value
  const color = value >= 0 ? 'text-[var(--color-secondary)]' : 'text-[var(--color-error)]';
  
  // Get the appropriate icon
  const icon = value >= 0 ? '▲' : '▼';

  return (
    <span className={`${color} ${className}`}>
      {showIcon && <span className="mr-1">{icon}</span>}
      {showPercentage && formatAbsolutePercentage(value)}
      {label && <span className="text-gray-400 ml-1">({label})</span>}
    </span>
  );
}

/**
 * ChangeIndicatorWithSign - Variant that shows the +/- sign instead of arrows
 * 
 * @example
 * ```tsx
 * <ChangeIndicatorWithSign value={5.2} />
 * // Displays: +5.20%
 * ```
 */
export function ChangeIndicatorWithSign({
  value,
  className = '',
  label,
}: Omit<ChangeIndicatorProps, 'showIcon' | 'showPercentage'>) {
  if (value === undefined) return null;

  const color = value >= 0 ? 'text-[var(--color-secondary)]' : 'text-[var(--color-error)]';

  return (
    <span className={`${color} ${className}`}>
      {formatPercentage(value)}
      {label && <span className="text-gray-400 ml-1">({label})</span>}
    </span>
  );
}

// Made with Bob
