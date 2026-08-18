import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LiquidMetalButton } from './LiquidMetalButton.js';

describe('LiquidMetalButton', () => {
  it('renders a pill chrome button by default', () => {
    render(<LiquidMetalButton>Save</LiquidMetalButton>);

    const result = screen.getByRole('button', { name: 'Save' });

    expect(result).toHaveClass('lm-button');
    expect(result).toHaveClass('lm-button-pill');
    expect(result.className).not.toMatch(/ui-button/);
  });

  it('renders a circle chrome button', () => {
    render(
      <LiquidMetalButton shape="circle" aria-label="Close">
        ×
      </LiquidMetalButton>,
    );

    const result = screen.getByRole('button', { name: 'Close' });

    expect(result).toHaveClass('lm-button-circle');
    expect(result.className).not.toMatch(/ui-button/);
  });
});
