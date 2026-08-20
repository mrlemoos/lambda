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
    expect(result).toHaveAttribute('data-slot', 'button');
  });

  it('keeps the label on the button instead of an inset island', () => {
    render(<LiquidMetalButton>Save</LiquidMetalButton>);

    const result = screen.getByRole('button', { name: 'Save' });

    expect(result.querySelector('.lm-rim')).toBeNull();
    expect(result.querySelector('.lm-fill')).toBeNull();
    expect(result).toHaveTextContent('Save');
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

  it('forwards autofocus to the button element', () => {
    // oxlint-disable-next-line jsx-a11y/no-autofocus -- verifies prop forwarding
    render(<LiquidMetalButton autoFocus>Save</LiquidMetalButton>);

    const result = screen.getByRole('button', { name: 'Save' });

    expect(result).toHaveFocus();
  });
});
