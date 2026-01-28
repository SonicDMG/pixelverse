'use client';

import { formatValue } from '@/utils/formatters';
import { ChangeIndicatorWithSign } from '@/components/shared';
import { TABLE_STYLES, TEXT_STYLES } from '@/constants/styles';

interface ComparisonTableProps {
  title: string;
  items: Array<{
    label: string;
    value1: string | number;
    value2: string | number;
    change?: number;
  }>;
  column1Label: string;
  column2Label: string;
}

export function ComparisonTable({
  title,
  items,
  column1Label,
  column2Label,
}: ComparisonTableProps) {
  return (
    <div className={TABLE_STYLES.container}>
      <h3 className={TEXT_STYLES.heading}>{title}</h3>
      <div className={TABLE_STYLES.overflow}>
        <table className={TABLE_STYLES.table}>
          <thead>
            <tr className={TABLE_STYLES.header}>
              <th className={TABLE_STYLES.headerCell}>
                Metric
              </th>
              <th className={`${TABLE_STYLES.headerCell} text-right`}>
                {column1Label}
              </th>
              <th className={`${TABLE_STYLES.headerCell} text-right text-[var(--color-secondary)]`}>
                {column2Label}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={TABLE_STYLES.row}>
                <td className={TABLE_STYLES.cell}>
                  {item.label}
                </td>
                <td className={`${TABLE_STYLES.cell} text-right text-[var(--color-primary)]`}>
                  {formatValue(item.value1)}
                </td>
                <td className={`${TABLE_STYLES.cell} text-right text-[var(--color-secondary)]`}>
                  {formatValue(item.value2)}
                  {item.change !== undefined && (
                    <span className="ml-2">
                      (<ChangeIndicatorWithSign value={item.change} />)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Made with Bob
