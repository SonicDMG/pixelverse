'use client';

import { PixelTable } from '@/components/shared';

interface DataTableProps {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  highlightColumn?: number;
}

export default function DataTable({ title, headers, rows, highlightColumn }: DataTableProps) {
  return (
    <PixelTable
      title={title}
      headers={headers}
      rows={rows}
      highlightColumn={highlightColumn}
    />
  );
}

// Made with Bob
