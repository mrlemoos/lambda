import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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

  it('places the film crew illustration before the form', () => {
    const authClient = {
      signIn: { email: vi.fn() },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    render(<SignInForm authClient={authClient} />);

    const illustration = screen.getByRole('img', {
      name: 'Film crew with a camera',
    });
    const heading = screen.getByRole('heading', { name: 'Sign in' });
    const result = Boolean(
      illustration.compareDocumentPosition(heading) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(result).toBe(true);
  });

  it('links to the sign-up page', () => {
    const authClient = {
      signIn: { email: vi.fn() },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    render(<SignInForm authClient={authClient} />);

    const result = screen.getByRole('link', { name: 'Create account' });

    expect(result).toHaveAttribute('href', '/sign-up');
  });

  it('renders an injected Link for the sign-up switch', () => {
    const authClient = {
      signIn: { email: vi.fn() },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    function InjectedLink({
      href,
      className,
      children,
    }: {
      href: string;
      className?: string;
      children?: ReactNode;
    }) {
      return (
        <a href={href} className={className} data-auth-link="injected">
          {children}
        </a>
      );
    }

    render(<SignInForm authClient={authClient} Link={InjectedLink} />);

    const result = screen.getByRole('link', { name: 'Create account' });

    expect(result).toHaveAttribute('data-auth-link', 'injected');
    expect(result).toHaveAttribute('href', '/sign-up');
    expect(result).toHaveClass(
      'text-primary',
      'underline',
      'underline-offset-2',
    );
  });

  it('reveals the password from the icon control', async () => {
    const user = userEvent.setup();
    const authClient = {
      signIn: { email: vi.fn() },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    render(<SignInForm authClient={authClient} />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    const result = screen.getByLabelText('Password');

    expect(result).toHaveAttribute('type', 'text');
  });

  it('autofocuses the submit button', () => {
    const authClient = {
      signIn: { email: vi.fn() },
    } as unknown as Parameters<typeof SignInForm>[0]['authClient'];

    render(<SignInForm authClient={authClient} />);

    const result = screen.getByRole('button', { name: 'Sign in' });

    expect(result).toHaveFocus();
  });
});
