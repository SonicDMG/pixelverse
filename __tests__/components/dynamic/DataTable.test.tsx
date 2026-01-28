import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTable from '@/components/dynamic/DataTable';

describe('DataTable', () => {
  const mockHeaders = ['Name', 'Price', 'Volume'];
  const mockRows = [
    ['AAPL', 150.25, 1000000],
    ['GOOGL', 2800.50, 500000],
    ['MSFT', 300.75, 750000],
  ];

  describe('basic rendering', () => {
    it('should render title', () => {
      render(
        <DataTable
          title="Stock Data"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText('Stock Data')).toBeInTheDocument();
    });

    it('should render all headers', () => {
      render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('should render all rows', () => {
      render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
    });

    it('should render numeric values', () => {
      render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText('150.25')).toBeInTheDocument();
      expect(screen.getByText('2,800.5')).toBeInTheDocument();
      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('should render string values', () => {
      render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });
  });

  describe('table structure', () => {
    it('should render table element', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should render thead element', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(container.querySelector('thead')).toBeInTheDocument();
    });

    it('should render tbody element', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('should render correct number of header cells', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells).toHaveLength(3);
    });

    it('should render correct number of rows', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(3);
    });

    it('should render correct number of cells per row', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const firstRow = container.querySelector('tbody tr');
      const cells = firstRow?.querySelectorAll('td');
      expect(cells).toHaveLength(3);
    });
  });

  describe('number formatting', () => {
    it('should format large numbers with commas', () => {
      render(
        <DataTable
          title="Test Table"
          headers={['Value']}
          rows={[[1000000]]}
        />
      );

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('should format decimal numbers', () => {
      render(
        <DataTable
          title="Test Table"
          headers={['Price']}
          rows={[[123.456]]}
        />
      );

      expect(screen.getByText('123.456')).toBeInTheDocument();
    });

    it('should not format string values', () => {
      render(
        <DataTable
          title="Test Table"
          headers={['Symbol']}
          rows={[['AAPL']]}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      render(
        <DataTable
          title="Test Table"
          headers={['Count']}
          rows={[[0]]}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(
        <DataTable
          title="Test Table"
          headers={['Change']}
          rows={[[-500]]}
        />
      );

      expect(screen.getByText('-500')).toBeInTheDocument();
    });
  });

  describe('column highlighting', () => {
    it('should highlight specified column in headers', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
          highlightColumn={1}
        />
      );

      const headers = container.querySelectorAll('thead th');
      expect(headers[1]).toHaveClass('text-[var(--color-secondary)]');
    });

    it('should not highlight other columns in headers', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
          highlightColumn={1}
        />
      );

      const headers = container.querySelectorAll('thead th');
      expect(headers[0]).toHaveClass('text-[var(--color-primary)]');
      expect(headers[2]).toHaveClass('text-[var(--color-primary)]');
    });

    it('should highlight specified column in data cells', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
          highlightColumn={1}
        />
      );

      const firstRow = container.querySelector('tbody tr');
      const cells = firstRow?.querySelectorAll('td');
      expect(cells?.[1]).toHaveClass('text-[var(--color-secondary)]');
      expect(cells?.[1]).toHaveClass('font-bold');
    });

    it('should not highlight when highlightColumn is undefined', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const headers = container.querySelectorAll('thead th');
      headers.forEach(header => {
        expect(header).toHaveClass('text-[var(--color-primary)]');
      });
    });

    it('should handle highlightColumn of 0', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
          highlightColumn={0}
        />
      );

      const headers = container.querySelectorAll('thead th');
      expect(headers[0]).toHaveClass('text-[var(--color-secondary)]');
    });
  });

  describe('styling', () => {
    it('should apply cyberpunk theme styling', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-[var(--color-bg-dark)]');
      expect(wrapper).toHaveClass('border-4');
      expect(wrapper).toHaveClass('border-[var(--color-primary)]');
      expect(wrapper).toHaveClass('pixel-border');
    });

    it('should apply scanline effect', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('scanline-container');
    });

    it('should apply glow effect to title', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const title = screen.getByText('Test Table');
      expect(title).toHaveClass('glow-text-subtle');
    });

    it('should apply hover effects to rows', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-[var(--color-bg-card)]');
        expect(row).toHaveClass('transition-colors');
      });
    });

    it('should apply font-pixel class', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const title = screen.getByText('Test Table');
      expect(title).toHaveClass('font-pixel');

      const cells = container.querySelectorAll('td');
      cells.forEach(cell => {
        expect(cell).toHaveClass('font-pixel');
      });
    });

    it('should have overflow-x-auto for scrolling', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should render with empty rows', () => {
      render(
        <DataTable
          title="Empty Table"
          headers={mockHeaders}
          rows={[]}
        />
      );

      expect(screen.getByText('Empty Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should render with single row', () => {
      render(
        <DataTable
          title="Single Row"
          headers={mockHeaders}
          rows={[['AAPL', 150, 1000000]]}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should render with single column', () => {
      render(
        <DataTable
          title="Single Column"
          headers={['Name']}
          rows={[['AAPL'], ['GOOGL'], ['MSFT']]}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long table titles', () => {
      const longTitle = 'This is a very long table title that might wrap to multiple lines';
      render(
        <DataTable
          title={longTitle}
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long header names', () => {
      const longHeaders = ['Very Long Header Name', 'Another Long Header', 'Third Long Header'];
      render(
        <DataTable
          title="Test"
          headers={longHeaders}
          rows={[['A', 'B', 'C']]}
        />
      );

      expect(screen.getByText('Very Long Header Name')).toBeInTheDocument();
    });

    it('should handle very long cell values', () => {
      const longValue = 'This is a very long cell value that might need to wrap';
      render(
        <DataTable
          title="Test"
          headers={['Description']}
          rows={[[longValue]]}
        />
      );

      expect(screen.getByText(longValue)).toBeInTheDocument();
    });

    it('should handle mixed data types in same column', () => {
      render(
        <DataTable
          title="Mixed Types"
          headers={['Value']}
          rows={[[100], ['Text'], [200.5]]}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('200.5')).toBeInTheDocument();
    });

    it('should handle special characters in strings', () => {
      render(
        <DataTable
          title="Special Chars"
          headers={['Symbol']}
          rows={[['$AAPL@100%']]}
        />
      );

      expect(screen.getByText('$AAPL@100%')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      render(
        <DataTable
          title="Big Numbers"
          headers={['Value']}
          rows={[[999999999999]]}
        />
      );

      expect(screen.getByText('999,999,999,999')).toBeInTheDocument();
    });

    it('should handle many rows', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => [
        `Item ${i}`,
        i * 100,
        i * 1000,
      ]);

      const { container } = render(
        <DataTable
          title="Many Rows"
          headers={mockHeaders}
          rows={manyRows}
        />
      );

      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(100);
    });

    it('should handle many columns', () => {
      const manyHeaders = Array.from({ length: 20 }, (_, i) => `Col ${i}`);
      const manyRows = [Array.from({ length: 20 }, (_, i) => i)];

      const { container } = render(
        <DataTable
          title="Many Columns"
          headers={manyHeaders}
          rows={manyRows}
        />
      );

      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells).toHaveLength(20);
    });
  });

  describe('accessibility', () => {
    it('should use semantic table elements', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelector('th')).toBeInTheDocument();
      expect(container.querySelector('td')).toBeInTheDocument();
    });

    it('should use heading for title', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Table');
    });

    it('should have proper text alignment', () => {
      const { container } = render(
        <DataTable
          title="Test Table"
          headers={mockHeaders}
          rows={mockRows}
        />
      );

      const headers = container.querySelectorAll('thead th');
      headers.forEach(header => {
        expect(header).toHaveClass('text-left');
      });
    });
  });

  describe('complete examples', () => {
    it('should render complete financial table', () => {
      render(
        <DataTable
          title="Stock Performance"
          headers={['Symbol', 'Price', 'Change', 'Volume']}
          rows={[
            ['AAPL', 150.25, 2.5, 1000000],
            ['GOOGL', 2800.50, -1.2, 500000],
            ['MSFT', 300.75, 0.8, 750000],
          ]}
          highlightColumn={2}
        />
      );

      expect(screen.getByText('Stock Performance')).toBeInTheDocument();
      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('150.25')).toBeInTheDocument();
    });

    it('should render minimal table', () => {
      render(
        <DataTable
          title="Simple"
          headers={['Name']}
          rows={[['Item']]}
        />
      );

      expect(screen.getByText('Simple')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
    });
  });
});

// Made with Bob