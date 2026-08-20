import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from './ThemeProvider.js';

describe('ThemeProvider', () => {
  it('renders children inside a class-based theme provider', () => {
    render(
      <ThemeProvider>
        <p>Lambda</p>
      </ThemeProvider>,
    );

    const result = screen.getByText('Lambda');

    expect(result).not.toBeNull();
  });
});
