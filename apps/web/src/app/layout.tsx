import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@lambda/shell/styles.css';

import '../styles.css';

export const metadata: Metadata = {
  title: 'Lambda',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-platform="web">
      <body>{children}</body>
    </html>
  );
}
