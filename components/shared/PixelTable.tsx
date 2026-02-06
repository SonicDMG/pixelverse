'use client';

import { TABLE_STYLES, TEXT_STYLES } from '@/constants/styles';
import { formatValue } from '@/utils/formatting/formatters';

interface PixelTableProps {
  /** Table title */
  title?: string;
  /** Column headers */
  headers: string[];
  /** Table rows data */
  rows: Array<Array<string | number | React.ReactNode>>;
  /** Index of column to highlight (optional) */
  highlightColumn?: number;
  /** Additional CSS classes */
  className?: string;
  /** Custom header cell renderer */
  renderHeaderCell?: (header: string, index: number) => React.ReactNode;
  /** Custom body cell renderer */
  renderBodyCell?: (cell: string | number | React.ReactNode, rowIndex: number, cellIndex: number) => React.ReactNode;
}

/**
 * PixelTable - A reusable table component with pixel-themed styling
 * 
 * Provides consistent table styling with support for:
 * - Optional title
 * - Column highlighting
 * - Custom cell rendering
 * - Automatic number formatting
 * - Hover effects
 * 
 * @example
 * ```tsx
 * <PixelTable
 *   title="Stock Data"
 *   headers={['Symbol', 'Price', 'Change']}
 *   rows={[
 *     ['AAPL', 150.25, '+2.5%'],
 *     ['GOOGL', 2800.50, '-1.2%']
 *   ]}
 *   highlightColumn={2}
 * />
 * ```
 */
export function PixelTable({
  title,
  headers,
  rows,
  highlightColumn,
  className = '',
  renderHeaderCell,
  renderBodyCell,
}: PixelTableProps) {
  const defaultRenderHeaderCell = (header: string, index: number) => (
    <th
      key={index}
      className={`${TABLE_STYLES.headerCell} ${
        highlightColumn === index ? 'text-[var(--color-secondary)]' : ''
      }`}
    >
      {header}
    </th>
  );

  const defaultRenderBodyCell = (
    cell: string | number | React.ReactNode,
    rowIndex: number,
    cellIndex: number
  ) => {
    // If cell is a React node, render it directly
    if (typeof cell === 'object' && cell !== null) {
      return (
        <td
          key={cellIndex}
          className={`${TABLE_STYLES.cell} ${
            highlightColumn === cellIndex
              ? 'text-[var(--color-secondary)] font-bold'
              : ''
          }`}
        >
          {cell}
        </td>
      );
    }

    // Format numbers automatically
    const formattedCell = typeof cell === 'number' ? formatValue(cell) : cell;

    return (
      <td
        key={cellIndex}
        className={`${TABLE_STYLES.cell} ${
          highlightColumn === cellIndex
            ? 'text-[var(--color-secondary)] font-bold'
            : ''
        }`}
      >
        {formattedCell}
      </td>
    );
  };

  const headerRenderer = renderHeaderCell || defaultRenderHeaderCell;
  const cellRenderer = renderBodyCell || defaultRenderBodyCell;

  return (
    <div className={`${TABLE_STYLES.container} ${className}`}>
      {title && <h3 className={TEXT_STYLES.heading}>{title}</h3>}
      <div className={TABLE_STYLES.overflow}>
        <table className={TABLE_STYLES.table}>
          <thead>
            <tr className={TABLE_STYLES.header}>
              {headers.map((header, index) => headerRenderer(header, index))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={TABLE_STYLES.row}>
                {row.map((cell, cellIndex) =>
                  cellRenderer(cell, rowIndex, cellIndex)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * PixelTableSimple - A simplified table without container styling
 * Useful when you want to embed a table in another component
 * 
 * @example
 * ```tsx
 * <PixelCard>
 *   <PixelTableSimple
 *     headers={['Name', 'Value']}
 *     rows={[['Item 1', 100], ['Item 2', 200]]}
 *   />
 * </PixelCard>
 * ```
 */
export function PixelTableSimple({
  headers,
  rows,
  highlightColumn,
  className = '',
}: Omit<PixelTableProps, 'title' | 'renderHeaderCell' | 'renderBodyCell'>) {
  return (
    <div className={`${TABLE_STYLES.overflow} ${className}`}>
      <table className={TABLE_STYLES.table}>
        <thead>
          <tr className={TABLE_STYLES.header}>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`${TABLE_STYLES.headerCell} ${
                  highlightColumn === index ? 'text-[var(--color-secondary)]' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={TABLE_STYLES.row}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`${TABLE_STYLES.cell} ${
                    highlightColumn === cellIndex
                      ? 'text-[var(--color-secondary)] font-bold'
                      : ''
                  }`}
                >
                  {typeof cell === 'number' ? formatValue(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Made with Bob
