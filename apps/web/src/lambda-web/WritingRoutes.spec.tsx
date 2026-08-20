import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { WritingRoutes } from './WritingRoutes.js';

vi.mock('@lambda/welcome', () => ({
  WelcomePage: () => <h1>Lambda</h1>,
}));

vi.mock('@lambda/script-workspace', () => ({
  ScriptPage: () => <div>Script</div>,
}));

vi.mock('@lambda/preview-workspace', () => ({
  PreviewPage: () => <div>Preview</div>,
}));

vi.mock('@lambda/auth-forms', () => ({
  SignInForm: () => <h1>Sign in</h1>,
  SignUpForm: () => <h1>Create account</h1>,
}));

describe('WritingRoutes', () => {
  it('renders the welcome screen at the root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WritingRoutes />
      </MemoryRouter>,
    );

    const result = screen.getByRole('heading', { name: 'Lambda' });

    expect(result).not.toBeNull();
  });

  it('renders sign-in at /sign-in', () => {
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <WritingRoutes />
      </MemoryRouter>,
    );

    const result = screen.getByRole('heading', { name: 'Sign in' });

    expect(result).not.toBeNull();
  });

  it('renders sign-up at /sign-up', () => {
    render(
      <MemoryRouter initialEntries={['/sign-up']}>
        <WritingRoutes />
      </MemoryRouter>,
    );

    const result = screen.getByRole('heading', { name: 'Create account' });

    expect(result).not.toBeNull();
  });
});
