import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@lambda/theme';
import '@lambda/theme/chrome.css';

import { WritingProviders } from '../lambda-web/WritingProviders.js';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Lambda',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-platform="web" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <WritingProviders>{children}</WritingProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
