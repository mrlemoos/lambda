import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input.js';

describe('Input', () => {
  it('renders a labelled chrome field', () => {
    render(<Input aria-label="Email" />);

    const result = screen.getByRole('textbox', { name: 'Email' });

    expect(result.closest('.lm-field')).not.toBeNull();
    expect(result.closest('.lm-field')?.querySelector('.lm-rim')).toBeNull();
    expect(result).toHaveAttribute('data-slot', 'input');
    expect(result.closest('[data-slot="input-field"]')).not.toBeNull();
  });

  it('renders an end control inside the chrome field', () => {
    render(
      <Input aria-label="Password">
        <button type="button" aria-label="Show password" />
      </Input>,
    );

    const field = screen.getByLabelText('Password').closest('.lm-field');
    const result = field?.contains(
      screen.getByRole('button', { name: 'Show password' }),
    );

    expect(result).toBe(true);
  });
});
