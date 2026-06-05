import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorContent } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createScriptEditor } from './useScriptEditor';

describe('ClassifyCurrentBlock', () => {
  it('formats a full character and dialogue exchange like the editor screenshot', async () => {
    const user = userEvent.setup();
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    const proseMirror = await waitFor(() => {
      const element = document.querySelector('.ProseMirror');

      if (!element) {
        throw new Error('Editor not ready');
      }

      return element;
    });

    await user.click(proseMirror);
    await user.type(proseMirror, 'INT. HOUSE - DAY{Enter}');
    await user.type(proseMirror, 'Some action line goes here...{Enter}');
    await user.type(proseMirror, 'CHARACTER NAME');
    await user.keyboard('{Enter}');
    await user.type(proseMirror, 'This is a line of dialogue.');

    await waitFor(() => {
      expect(editor.getHTML()).toContain('class="character"');
      expect(editor.getHTML()).toMatch(
        /class="dialogue"[^>]*>[^<]*This is a line of dialogue/,
      );
    });

    editor.destroy();
  });

  it('applies character and dialogue formatting while typing', async () => {
    const user = userEvent.setup();
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    const proseMirror = await waitFor(() => {
      const element = document.querySelector('.ProseMirror');

      if (!element) {
        throw new Error('Editor not ready');
      }

      return element;
    });

    await user.click(proseMirror);
    await user.type(proseMirror, 'STEEL');
    await user.keyboard('{Enter}');
    await user.type(proseMirror, 'Hello?');

    expect(editor.getHTML()).toContain('class="character"');
    expect(editor.getHTML()).toContain('class="dialogue"');

    editor.destroy();
  });
});
