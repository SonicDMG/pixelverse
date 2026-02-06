/**
 * Shared formatting utilities for consistent data display across components
 */

/**
 * Format a value for display, converting numbers to locale strings
 * @param value - The value to format (string or number)
 * @returns Formatted string representation
 */
export function formatValue(value: string | number): string {
  return typeof value === 'number' ? value.toLocaleString() : value;
}

/**
 * Format a percentage value with optional sign and decimal places
 * @param value - The percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string with sign
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a change value with absolute value
 * @param value - The change value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted absolute percentage string
 */
export function formatAbsolutePercentage(value: number, decimals: number = 2): string {
  return `${Math.abs(value).toFixed(decimals)}%`;
}

// Made with Bob
