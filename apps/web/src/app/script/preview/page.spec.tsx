import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/preview-workspace', () => ({
  PreviewPage: () => <div>Preview</div>,
}));

describe('PreviewRoute', () => {
  it('renders the preview workspace', async () => {
    const { default: PreviewRoute } = await import('./page.js');

    render(<PreviewRoute />);

    const result = screen.getByText('Preview');

    expect(result).toBeInTheDocument();
  });
});
