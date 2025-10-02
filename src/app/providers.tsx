'use client';

import React from 'react';
import { Provider } from 'jotai';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Provider>
        {children}
      </Provider>
    </ThemeProvider>
  );
}