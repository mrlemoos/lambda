import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordField } from './PasswordField.js';

describe('PasswordField', () => {
  it('masks the password by default', () => {
    render(
      <PasswordField
        name="password"
        value="secret"
        autoComplete="current-password"
        onChange={() => undefined}
        onBlur={() => undefined}
        fieldRef={() => undefined}
      />,
    );

    const result = screen.getByLabelText('Password');

    expect(result).toHaveAttribute('type', 'password');
    expect(
      screen
        .getByRole('button', { name: 'Show password' })
        .querySelector('svg'),
    ).not.toBeNull();
  });

  it('reveals the password from the icon control', async () => {
    const user = userEvent.setup();

    render(
      <PasswordField
        name="password"
        value="secret"
        autoComplete="current-password"
        onChange={() => undefined}
        onBlur={() => undefined}
        fieldRef={() => undefined}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    const result = screen.getByLabelText('Password');

    expect(result).toHaveAttribute('type', 'text');
    expect(
      screen
        .getByRole('button', { name: 'Hide password' })
        .querySelector('svg'),
    ).not.toBeNull();
  });
});
