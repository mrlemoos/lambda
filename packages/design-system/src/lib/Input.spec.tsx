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
});
