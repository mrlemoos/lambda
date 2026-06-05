import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ScriptEditorSurface } from './ScriptEditorSurface';

function pressEnter(element: Element) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    }),
  );
}

describe('ScriptEditorSurface', () => {
  it('shows page number 1 on the first body page', async () => {
    render(<ScriptEditorSurface />);

    const pageNumber = await waitFor(() => screen.getByText('1.'));

    expect(pageNumber).toHaveClass('script-page-number');
  });

  it('classifies a scene heading when the user presses Enter', async () => {
    const user = userEvent.setup();

    render(<ScriptEditorSurface />);

    const editor = await waitFor(() => {
      const proseMirror = document.querySelector('.ProseMirror');

      if (!proseMirror) {
        throw new Error('Editor not ready');
      }

      return proseMirror;
    });

    await user.click(editor);
    await user.type(editor, 'INT. KITCHEN - DAY');
    pressEnter(editor);

    const heading = screen.getByText('INT. KITCHEN - DAY');

    expect(heading).toHaveClass('scene-heading');
  });

  it('indents dialogue after a character cue', async () => {
    const user = userEvent.setup();

    render(<ScriptEditorSurface />);

    const editor = await waitFor(() => {
      const proseMirror = document.querySelector('.ProseMirror');

      if (!proseMirror) {
        throw new Error('Editor not ready');
      }

      return proseMirror;
    });

    await user.click(editor);
    await user.type(editor, 'INT. HOUSE - DAY');
    pressEnter(editor);
    await user.type(editor, 'Some action line goes here...');
    pressEnter(editor);
    await user.type(editor, 'CHARACTER NAME');
    pressEnter(editor);
    await user.type(editor, 'This is a line of dialogue.');

    const dialogue = await screen.findByText('This is a line of dialogue.');

    expect(dialogue).toHaveClass('dialogue');

    pressEnter(editor);
    await user.type(editor, 'He crosses the room.');

    const action = await screen.findByText('He crosses the room.');

    expect(action).toHaveClass('action');
  });
});
