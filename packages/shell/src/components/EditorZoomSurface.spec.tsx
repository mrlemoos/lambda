import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditorZoomSurface } from './EditorZoomSurface.js';

describe('EditorZoomSurface', () => {
  it('applies visual scale to page sheets', () => {
    class TestResizeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', TestResizeObserver);

    render(
      <EditorZoomSurface level={125}>
        <div data-testid="page-sheet">Page</div>
      </EditorZoomSurface>,
    );

    const scale = screen.getByTestId('editor-zoom-scale');

    expect(scale).toHaveStyle({ transform: 'scale(1.25)' });
  });
});
