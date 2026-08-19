import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/welcome', () => ({
  WelcomePage: () => <h1>Lambda</h1>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../lambda-web/WritingAccessProvider.js', () => ({
  useWritingAccess: () => ({
    writingAccess: 'write',
    hasSession: false,
    isPending: false,
  }),
}));

describe('WelcomeRoute', () => {
  it('renders the welcome screen', async () => {
    const { default: WelcomeRoute } = await import('./page.js');

    render(<WelcomeRoute />);

    const result = screen.getByRole('heading', { name: 'Lambda' });

    expect(result).toBeInTheDocument();
  });
});
