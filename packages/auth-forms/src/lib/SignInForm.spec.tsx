import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SignInForm } from './SignInForm.js';

describe('SignInForm', () => {
  it('submits email and password to the auth client', async () => {
    const user = userEvent.setup();
    const signInEmail = vi.fn(async () => undefined);
    const authClient = {
      signIn: { email: signInEmail },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    render(<SignInForm authClient={authClient} />);

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signInEmail).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'correct horse',
    });
  });
});
