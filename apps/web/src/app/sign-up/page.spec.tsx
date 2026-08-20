import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/auth-forms', () => ({
  SignUpForm: ({ Link }: { Link?: unknown }) => (
    <h1>{Link ? 'Create account with Link' : 'Create account'}</h1>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SignUpRoute', () => {
  it('renders sign-up with an injected Next.js Link', async () => {
    const { default: SignUpRoute } = await import('./page.js');

    render(<SignUpRoute />);

    const result = screen.getByRole('heading', {
      name: 'Create account with Link',
    });

    expect(result).toBeInTheDocument();
  });
});
