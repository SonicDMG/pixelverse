import { formatValue, formatPercentage, formatAbsolutePercentage } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatValue', () => {
    it('should format numbers with locale string', () => {
      expect(formatValue(1000)).toBe('1,000');
      expect(formatValue(1234567)).toBe('1,234,567');
      expect(formatValue(0)).toBe('0');
    });

    it('should return strings unchanged', () => {
      expect(formatValue('test')).toBe('test');
      expect(formatValue('$100')).toBe('$100');
      expect(formatValue('')).toBe('');
    });

    it('should handle decimal numbers', () => {
      expect(formatValue(1234.56)).toBe('1,234.56');
      expect(formatValue(0.123)).toBe('0.123');
    });

    it('should handle negative numbers', () => {
      expect(formatValue(-1000)).toBe('-1,000');
      expect(formatValue(-1234.56)).toBe('-1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentages with + sign', () => {
      expect(formatPercentage(5.25)).toBe('+5.25%');
      expect(formatPercentage(10)).toBe('+10.00%');
      expect(formatPercentage(0.5)).toBe('+0.50%');
    });

    it('should format negative percentages with - sign', () => {
      expect(formatPercentage(-5.25)).toBe('-5.25%');
      expect(formatPercentage(-10)).toBe('-10.00%');
      expect(formatPercentage(-0.5)).toBe('-0.50%');
    });

    it('should format zero with + sign', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });

    it('should respect custom decimal places', () => {
      expect(formatPercentage(5.12345, 0)).toBe('+5%');
      expect(formatPercentage(5.12345, 1)).toBe('+5.1%');
      expect(formatPercentage(5.12345, 3)).toBe('+5.123%');
      expect(formatPercentage(-5.12345, 4)).toBe('-5.1235%');
    });
  });

  describe('formatAbsolutePercentage', () => {
    it('should format positive percentages without sign', () => {
      expect(formatAbsolutePercentage(5.25)).toBe('5.25%');
      expect(formatAbsolutePercentage(10)).toBe('10.00%');
      expect(formatAbsolutePercentage(0.5)).toBe('0.50%');
    });

    it('should format negative percentages as absolute values', () => {
      expect(formatAbsolutePercentage(-5.25)).toBe('5.25%');
      expect(formatAbsolutePercentage(-10)).toBe('10.00%');
      expect(formatAbsolutePercentage(-0.5)).toBe('0.50%');
    });

    it('should format zero', () => {
      expect(formatAbsolutePercentage(0)).toBe('0.00%');
    });

    it('should respect custom decimal places', () => {
      expect(formatAbsolutePercentage(5.12345, 0)).toBe('5%');
      expect(formatAbsolutePercentage(5.12345, 1)).toBe('5.1%');
      expect(formatAbsolutePercentage(-5.12345, 3)).toBe('5.123%');
      expect(formatAbsolutePercentage(-5.12345, 4)).toBe('5.1235%');
    });
  });
});

// Made with Bob
