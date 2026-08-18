import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SignUpForm } from './SignUpForm.js';

describe('SignUpForm', () => {
  it('submits name, email, and password to the auth client', async () => {
    const user = userEvent.setup();
    const signUpEmail = vi.fn(async () => undefined);
    const authClient = {
      signUp: { email: signUpEmail },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} />);

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct horse');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(signUpEmail).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse',
    });
  });
});
