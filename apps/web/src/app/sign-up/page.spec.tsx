import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/auth-forms', () => ({
  SignUpForm: () => <h1>Create account</h1>,
}));

describe('SignUpRoute', () => {
  it('renders sign-up', async () => {
    const { default: SignUpRoute } = await import('./page.js');

    render(<SignUpRoute />);

    const result = screen.getByRole('heading', { name: 'Create account' });

    expect(result).toBeInTheDocument();
  });
});
