import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lambda-web/WritingProviders.js', () => ({
  WritingProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="writing-providers">{children}</div>
  ),
}));

vi.mock('@lambda/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('RootLayout', () => {
  it('wraps pages in writing providers', async () => {
    const { default: RootLayout } = await import('./layout.js');

    render(
      <RootLayout>
        <h1>Lambda</h1>
      </RootLayout>,
    );

    const result = screen.getByTestId('writing-providers');

    expect(result).toContainElement(
      screen.getByRole('heading', { name: 'Lambda' }),
    );
  });
});
