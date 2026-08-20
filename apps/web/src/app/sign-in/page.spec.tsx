import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/auth-forms', () => ({
  SignInForm: ({ Link }: { Link?: unknown }) => (
    <h1>{Link ? 'Sign in with Link' : 'Sign in'}</h1>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SignInRoute', () => {
  it('renders sign-in with an injected Next.js Link', async () => {
    const { default: SignInRoute } = await import('./page.js');

    render(<SignInRoute />);

    const result = screen.getByRole('heading', { name: 'Sign in with Link' });

    expect(result).toBeInTheDocument();
  });
});
