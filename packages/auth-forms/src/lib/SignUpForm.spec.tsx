import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SignUpForm } from './SignUpForm.js';

describe('SignUpForm', () => {
  it('submits name, email, and password to the auth client', async () => {
    const user = userEvent.setup();
    const signUpEmail = vi.fn(async () => ({ error: null }));
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

  it('keeps the user on the form when account creation is rejected', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSignedUp = vi.fn();
    const authClient = {
      signUp: {
        email: vi.fn(async () => ({
          error: { message: 'Email is already in use' },
        })),
      },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} onSignedUp={onSignedUp} />);
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct horse');

    // Act
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    // Assert
    expect(onSignedUp).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email is already in use',
    );
  });

  it('places the film crew illustration before the form', () => {
    const authClient = {
      signUp: { email: vi.fn() },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} />);

    const illustration = screen.getByRole('img', {
      name: 'Film crew with a camera',
    });
    const heading = screen.getByRole('heading', { name: 'Create account' });
    const result = Boolean(
      illustration.compareDocumentPosition(heading) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(result).toBe(true);
  });

  it('links to the sign-in page', () => {
    const authClient = {
      signUp: { email: vi.fn() },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} />);

    const result = screen.getByRole('link', { name: 'Sign in' });

    expect(result).toHaveAttribute('href', '/sign-in');
  });

  it('renders an injected Link for the sign-in switch', () => {
    const authClient = {
      signUp: { email: vi.fn() },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

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

    render(<SignUpForm authClient={authClient} Link={InjectedLink} />);

    const result = screen.getByRole('link', { name: 'Sign in' });

    expect(result).toHaveAttribute('data-auth-link', 'injected');
    expect(result).toHaveAttribute('href', '/sign-in');
    expect(result).toHaveClass(
      'text-primary',
      'underline',
      'underline-offset-2',
    );
  });

  it('reveals the password from the icon control', async () => {
    const user = userEvent.setup();
    const authClient = {
      signUp: { email: vi.fn() },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    const result = screen.getByLabelText('Password');

    expect(result).toHaveAttribute('type', 'text');
  });

  it('autofocuses the submit button', () => {
    const authClient = {
      signUp: { email: vi.fn() },
    } as unknown as Parameters<typeof SignUpForm>[0]['authClient'];

    render(<SignUpForm authClient={authClient} />);

    const result = screen.getByRole('button', { name: 'Create account' });

    expect(result).toHaveFocus();
  });
});
