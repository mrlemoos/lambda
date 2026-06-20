import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScriptEditor } from './ScriptEditor';
import type { PaginationResult } from './pagination/types';

describe('ScriptEditor', () => {
  it('renders scene heading content with the scene-heading utility class', () => {
    render(
      <ScriptEditor>
        <p className="scene-heading">INT. KITCHEN - DAY</p>
      </ScriptEditor>,
    );

    const heading = screen.getByText('INT. KITCHEN - DAY');

    expect(heading).toHaveClass('scene-heading');
  });

  it('defaults page format to us-letter on the editor root', () => {
    render(
      <ScriptEditor>
        <p className="scene-heading">INT. KITCHEN - DAY</p>
      </ScriptEditor>,
    );

    const pageRoot = screen
      .getByText('INT. KITCHEN - DAY')
      .closest('[data-page-format]');

    expect(pageRoot).toHaveAttribute('data-page-format', 'us-letter');
  });

  it('applies a4 page format when requested', () => {
    render(
      <ScriptEditor pageFormat="a4">
        <p className="scene-heading">INT. KITCHEN - DAY</p>
      </ScriptEditor>,
    );

    const pageRoot = screen
      .getByText('INT. KITCHEN - DAY')
      .closest('[data-page-format]');

    expect(pageRoot).toHaveAttribute('data-page-format', 'a4');
  });

  it('renders pagination chrome in the editor', () => {
    const pagination: PaginationResult = {
      pages: [{ number: 1, topOffsetPt: 0 }],
      boundaries: [{ offsetPt: 648 }],
      placements: [],
      totalHeightPt: 1296,
      pageFormat: 'us-letter',
    };

    render(
      <ScriptEditor pagination={pagination}>
        <p className="action">A line on the page.</p>
      </ScriptEditor>,
    );

    expect(screen.getByText('1.')).toHaveClass('script-page-number');
    expect(document.querySelector('.script-page-boundary')).not.toBeNull();
  });
});
