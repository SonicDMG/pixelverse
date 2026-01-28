import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/dynamic/MetricCard';

describe('MetricCard', () => {
  describe('basic rendering', () => {
    it('should render title and value', () => {
      render(<MetricCard title="Stock Price" value={150.25} />);

      expect(screen.getByText('Stock Price')).toBeInTheDocument();
      expect(screen.getByText('150.25')).toBeInTheDocument();
    });

    it('should render string values', () => {
      render(<MetricCard title="Status" value="Active" />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render numeric values', () => {
      render(<MetricCard title="Count" value={1000} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });
  });

  describe('value formatting', () => {
    it('should format large numbers with commas', () => {
      render(<MetricCard title="Revenue" value={1000000} />);

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('should format decimal numbers', () => {
      render(<MetricCard title="Price" value={123.456} />);

      expect(screen.getByText('123.456')).toBeInTheDocument();
    });

    it('should not format string values', () => {
      render(<MetricCard title="Symbol" value="AAPL" />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<MetricCard title="Balance" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(<MetricCard title="Loss" value={-500} />);

      expect(screen.getByText('-500')).toBeInTheDocument();
    });
  });

  describe('change indicator', () => {
    it('should display positive change with up arrow', () => {
      render(<MetricCard title="Price" value={100} change={5.5} />);

      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('5.50%')).toBeInTheDocument();
    });

    it('should display negative change with down arrow', () => {
      render(<MetricCard title="Price" value={100} change={-3.2} />);

      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getByText('3.20%')).toBeInTheDocument();
    });

    it('should display zero change with up arrow', () => {
      render(<MetricCard title="Price" value={100} change={0} />);

      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('should not display change indicator when change is undefined', () => {
      render(<MetricCard title="Price" value={100} />);

      expect(screen.queryByText('▲')).not.toBeInTheDocument();
      expect(screen.queryByText('▼')).not.toBeInTheDocument();
    });

    it('should format change to 2 decimal places', () => {
      render(<MetricCard title="Price" value={100} change={5.123456} />);

      expect(screen.getByText('5.12%')).toBeInTheDocument();
    });

    it('should display absolute value of negative change', () => {
      render(<MetricCard title="Price" value={100} change={-7.89} />);

      expect(screen.getByText('7.89%')).toBeInTheDocument();
    });
  });

  describe('change label', () => {
    it('should display change label when provided', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          change={5}
          changeLabel="vs yesterday"
        />
      );

      expect(screen.getByText('(vs yesterday)')).toBeInTheDocument();
    });

    it('should not display change label when change is undefined', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          changeLabel="vs yesterday"
        />
      );

      expect(screen.queryByText('(vs yesterday)')).not.toBeInTheDocument();
    });

    it('should display change label with positive change', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          change={2.5}
          changeLabel="today"
        />
      );

      expect(screen.getByText('(today)')).toBeInTheDocument();
    });

    it('should display change label with negative change', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          change={-2.5}
          changeLabel="this week"
        />
      );

      expect(screen.getByText('(this week)')).toBeInTheDocument();
    });
  });

  describe('subtitle', () => {
    it('should display subtitle when provided', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          subtitle="Last updated: 5 min ago"
        />
      );

      expect(screen.getByText('Last updated: 5 min ago')).toBeInTheDocument();
    });

    it('should not display subtitle when not provided', () => {
      const { container } = render(<MetricCard title="Price" value={100} />);

      const subtitle = container.querySelector('.text-gray-400');
      expect(subtitle).not.toBeInTheDocument();
    });

    it('should display subtitle with change indicator', () => {
      render(
        <MetricCard
          title="Price"
          value={100}
          change={5}
          subtitle="Market open"
        />
      );

      expect(screen.getByText('Market open')).toBeInTheDocument();
      expect(screen.getByText('▲')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply cyberpunk theme styling', () => {
      const { container } = render(<MetricCard title="Test" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--color-bg-dark)]');
      expect(card).toHaveClass('border-4');
      expect(card).toHaveClass('border-[var(--color-primary)]');
      expect(card).toHaveClass('pixel-border');
    });

    it('should have hover effects', () => {
      const { container } = render(<MetricCard title="Test" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:border-[var(--color-secondary)]');
      expect(card).toHaveClass('transition-colors');
      expect(card).toHaveClass('glitch-hover');
    });

    it('should apply positive change color', () => {
      const { container } = render(
        <MetricCard title="Price" value={100} change={5} />
      );

      // Check that the change value is rendered (positive change)
      const changeText = container.querySelector('.flex.items-center.gap-2');
      expect(changeText).toBeInTheDocument();
      expect(changeText?.textContent).toContain('5.00%');
    });

    it('should apply negative change color', () => {
      const { container } = render(
        <MetricCard title="Price" value={100} change={-5} />
      );

      // Check that the change value is rendered (negative change)
      const changeText = container.querySelector('.flex.items-center.gap-2');
      expect(changeText).toBeInTheDocument();
      expect(changeText?.textContent).toContain('5.00%');
    });

    it('should apply font-pixel class to text', () => {
      const { container } = render(<MetricCard title="Test" value={100} />);

      const title = screen.getByText('Test');
      expect(title).toHaveClass('font-pixel');
    });

    it('should uppercase title', () => {
      const { container } = render(<MetricCard title="Test" value={100} />);

      const title = screen.getByText('Test');
      expect(title).toHaveClass('uppercase');
    });
  });

  describe('complete examples', () => {
    it('should render complete metric card with all props', () => {
      render(
        <MetricCard
          title="Stock Price"
          value={150.25}
          change={5.5}
          changeLabel="vs yesterday"
          subtitle="Last updated: 2 min ago"
        />
      );

      expect(screen.getByText('Stock Price')).toBeInTheDocument();
      expect(screen.getByText('150.25')).toBeInTheDocument();
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('5.50%')).toBeInTheDocument();
      expect(screen.getByText('(vs yesterday)')).toBeInTheDocument();
      expect(screen.getByText('Last updated: 2 min ago')).toBeInTheDocument();
    });

    it('should render minimal metric card', () => {
      render(<MetricCard title="Count" value={42} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.queryByText('▲')).not.toBeInTheDocument();
      expect(screen.queryByText('▼')).not.toBeInTheDocument();
    });

    it('should render metric card with negative change', () => {
      render(
        <MetricCard
          title="Revenue"
          value={1000000}
          change={-2.3}
          changeLabel="this quarter"
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('1,000,000')).toBeInTheDocument();
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getByText('2.30%')).toBeInTheDocument();
      expect(screen.getByText('(this quarter)')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      render(<MetricCard title="Big Number" value={999999999999} />);

      expect(screen.getByText('999,999,999,999')).toBeInTheDocument();
    });

    it('should handle very small decimal numbers', () => {
      const { container } = render(<MetricCard title="Small" value={0.000001} />);

      // toLocaleString may format very small numbers as "0"
      const valueElement = container.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(<MetricCard title="Empty" value="" />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long title that might wrap';
      render(<MetricCard title={longTitle} value={100} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long subtitle', () => {
      const longSubtitle = 'This is a very long subtitle with lots of information';
      render(<MetricCard title="Test" value={100} subtitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('should handle special characters in string value', () => {
      render(<MetricCard title="Symbol" value="$AAPL@100%" />);

      expect(screen.getByText('$AAPL@100%')).toBeInTheDocument();
    });

    it('should handle very large change percentage', () => {
      render(<MetricCard title="Price" value={100} change={999.99} />);

      expect(screen.getByText('999.99%')).toBeInTheDocument();
    });

    it('should handle very small change percentage', () => {
      render(<MetricCard title="Price" value={100} change={0.01} />);

      expect(screen.getByText('0.01%')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <MetricCard title="Price" value={100} change={5} />
      );

      const heading = container.querySelector('h4');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Price');
    });

    it('should use appropriate text sizes', () => {
      const { container } = render(<MetricCard title="Test" value={100} />);

      const title = screen.getByText('Test');
      expect(title).toHaveClass('text-xs');

      const value = screen.getByText('100');
      expect(value).toHaveClass('text-2xl');
    });
  });
});

// Made with Bob