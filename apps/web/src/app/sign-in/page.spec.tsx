import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/auth-forms', () => ({
  SignInForm: () => <h1>Sign in</h1>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SignInRoute', () => {
  it('renders sign-in', async () => {
    const { default: SignInRoute } = await import('./page.js');

    render(<SignInRoute />);

    const result = screen.getByRole('heading', { name: 'Sign in' });

    expect(result).toBeInTheDocument();
  });
});
