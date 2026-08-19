import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button.js';

describe('Button', () => {
  it('renders the liquid-metal chrome button', () => {
    render(<Button>Save</Button>);

    const result = screen.getByRole('button', { name: 'Save' });

    expect(result).toHaveClass('lm-button');
    expect(result).toHaveClass('lm-button-pill');
    expect(result).toHaveAttribute('data-slot', 'button');
  });
});
