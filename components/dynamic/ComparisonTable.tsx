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
    const color = change >= 0 ? 'text-[#00ff9f]' : 'text-[#ff0000]';
    return (
      <span className={`${color} text-xs ml-2`}>
        ({sign}{change.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="w-full p-6 bg-[#0a0e27] border-4 border-[#00ff9f] rounded-lg pixel-border">
      <h3 className="text-lg font-pixel text-[#00ff9f] mb-4 glow-text">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#00ff9f]">
              <th className="px-4 py-3 text-left font-pixel text-xs text-[#00ff9f]">
                Metric
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs text-[#00ff9f]">
                {column1Label}
              </th>
              <th className="px-4 py-3 text-right font-pixel text-xs text-[#ff00ff]">
                {column2Label}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[#00ff9f]/30 hover:bg-[#1a1f3a] transition-colors"
              >
                <td className="px-4 py-3 font-pixel text-xs text-white">
                  {item.label}
                </td>
                <td className="px-4 py-3 font-pixel text-xs text-right text-[#00ff9f]">
                  {formatValue(item.value1)}
                </td>
                <td className="px-4 py-3 font-pixel text-xs text-right text-[#ff00ff]">
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
