'use client';

interface DataTableProps {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  highlightColumn?: number;
}

export default function DataTable({ title, headers, rows, highlightColumn }: DataTableProps) {
  return (
    <div className="w-full p-6 bg-[#0a0e27] border-4 border-[#00ff9f] rounded-lg pixel-border scanline-container">
      <h3 className="text-lg font-pixel text-[#00ff9f] mb-4 glow-text">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#00ff9f]">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left font-pixel text-xs ${
                    highlightColumn === index ? 'text-[#ff00ff]' : 'text-[#00ff9f]'
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
                className="border-b border-[#00ff9f]/30 hover:bg-[#1a1f3a] transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-4 py-3 font-pixel text-xs ${
                      highlightColumn === cellIndex
                        ? 'text-[#ff00ff] font-bold'
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
