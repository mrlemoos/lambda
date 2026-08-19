import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/script-workspace', () => ({
  ScriptPage: () => <div>Script</div>,
}));

describe('ScriptRoute', () => {
  it('renders the script workspace', async () => {
    const { default: ScriptRoute } = await import('./page.js');

    render(<ScriptRoute />);

    const result = screen.getByText('Script');

    expect(result).toBeInTheDocument();
  });
});
