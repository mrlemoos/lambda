import { render, waitFor } from '@testing-library/react';
import { EditorContent } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createScriptEditor } from './useScriptEditor';

describe('NormalizeScriptBlocks', () => {
  it('reclassifies dialogue stored as action after a character cue on load', async () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'sceneHeading',
            content: [{ type: 'text', text: 'INT. HOUSE - DAY' }],
          },
          {
            type: 'action',
            content: [{ type: 'text', text: 'Some action line goes here...' }],
          },
          {
            type: 'character',
            content: [{ type: 'text', text: 'CHARACTER NAME' }],
          },
          {
            type: 'action',
            content: [{ type: 'text', text: 'This is a line of dialogue.' }],
          },
        ],
      },
    });

    render(<EditorContent editor={editor} />);

    await waitFor(() => {
      expect(editor.getHTML()).toMatch(
        /class="dialogue"[^>]*>[^<]*This is a line of dialogue/,
      );
    });

    editor.destroy();
  });

  it('does not classify prose as dialogue when a blank line follows uppercase action', async () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'action',
            content: [{ type: 'text', text: 'A DIGITAL AD' }],
          },
          {
            type: 'action',
          },
          {
            type: 'action',
            content: [{ type: 'text', text: 'This ad shines on a billboard.' }],
          },
        ],
      },
    });

    render(<EditorContent editor={editor} />);

    await waitFor(() => {
      expect(editor.getJSON().content?.map((node) => node.type)).toEqual([
        'action',
        'action',
        'action',
      ]);
    });

    editor.destroy();
  });
});
