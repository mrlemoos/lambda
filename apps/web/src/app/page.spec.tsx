import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/welcome', () => ({
  WelcomePage: () => <h1>Lambda</h1>,
}));

describe('WelcomeRoute', () => {
  it('renders the welcome screen', async () => {
    const { default: WelcomeRoute } = await import('./page.js');

    render(<WelcomeRoute />);

    const result = screen.getByRole('heading', { name: 'Lambda' });

    expect(result).toBeInTheDocument();
  });
});
