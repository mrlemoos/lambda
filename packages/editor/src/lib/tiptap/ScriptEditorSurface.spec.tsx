import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
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

function StatefulExistingScript({
  initialDocument,
}: {
  initialDocument: JSONContent;
}) {
  const [document, setDocument] = useState(initialDocument);

  return (
    <ScriptEditorSurface
      initialDocument={document}
      onDocumentChange={setDocument}
    />
  );
}

describe('ScriptEditorSurface', () => {
  it('does not show pagination chrome in the editable surface', async () => {
    render(<ScriptEditorSurface />);

    await waitFor(() => {
      const editor = document.querySelector('.ProseMirror');

      if (!editor) {
        throw new Error('Editor not ready');
      }
    });

    expect(screen.queryByText('1.')).not.toBeInTheDocument();
    expect(document.querySelector('.script-page-boundary')).toBeNull();
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

  it('keeps accepting typing when an existing document mirrors editor updates', async () => {
    const user = userEvent.setup();
    const existingDocument: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'action',
          content: [{ type: 'text', text: 'Existing line' }],
        },
      ],
    };

    render(<StatefulExistingScript initialDocument={existingDocument} />);

    const editor = await waitFor(() => {
      const proseMirror = document.querySelector('.ProseMirror');

      if (!proseMirror) {
        throw new Error('Editor not ready');
      }

      return proseMirror;
    });

    await user.click(editor);
    await user.type(editor, ' plus more');

    expect(screen.getByText('Existing line plus more')).toBeInTheDocument();
  });
});
