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
});
