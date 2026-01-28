'use client';

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

export default function ComparisonTable({
  title,
  items,
  column1Label,
  column2Label,
}: ComparisonTableProps) {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const formatChange = (change?: number) => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'text-[var(--color-secondary)]' : 'text-[var(--color-error)]';
    return (
      <span className={`${color} text-xs ml-2`}>
        ({sign}{change.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="w-full p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border">
      <h3 className="text-lg font-pixel text-[var(--color-primary)] mb-4 glow-text-subtle">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--color-primary)]">
              <th className="px-4 py-3 text-left font-pixel text-xs text-[var(--color-primary)]">
                Metric
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs text-[var(--color-primary)]">
                {column1Label}
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs text-[var(--color-secondary)]">
                {column2Label}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-card)] transition-colors"
              >
                <td className="px-4 py-3 font-pixel text-xs text-white">
                  {item.label}
                </td>
                <td className="px-4 py-3 font-pixel text-xs text-right text-[var(--color-primary)]">
                  {formatValue(item.value1)}
                </td>
                <td className="px-4 py-3 font-pixel text-xs text-right text-[var(--color-secondary)]">
                  {formatValue(item.value2)}
                  {formatChange(item.change)}
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
