'use client';

import { Suspense } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Suspense>
  );
}

// Made with Bob