import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@lambda/theme';
import '@lambda/theme/chrome.css';

import '../styles.css';

export const metadata: Metadata = {
  title: 'Lambda',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-platform="web" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
