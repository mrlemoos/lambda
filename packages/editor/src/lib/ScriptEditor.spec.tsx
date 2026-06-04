import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScriptEditor } from './ScriptEditor';

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
});
