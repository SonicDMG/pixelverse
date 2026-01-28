'use client';

interface DataTableProps {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  highlightColumn?: number;
}

export default function DataTable({ title, headers, rows, highlightColumn }: DataTableProps) {
  return (
    <div className="w-full p-6 bg-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border scanline-container">
      <h3 className="text-lg font-pixel text-[var(--color-primary)] mb-4 glow-text-subtle">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--color-primary)]">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left font-pixel text-xs ${
                    highlightColumn === index ? 'text-[var(--color-secondary)]' : 'text-[var(--color-primary)]'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-card)] transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-4 py-3 font-pixel text-xs ${
                      highlightColumn === cellIndex
                        ? 'text-[var(--color-secondary)] font-bold'
                        : 'text-white'
                    }`}
                  >
                    {typeof cell === 'number' ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Made with Bob
