import { render } from '@testing-library/react';
import { EditorContent } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createScriptEditor } from './useScriptEditor';

describe('inline markup', () => {
  it('renders bold, italic, and underline marks in script elements and synopsis', () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'action',
            content: [
              { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' ' },
              { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
              { type: 'text', text: ' ' },
              {
                type: 'text',
                text: 'under',
                marks: [{ type: 'underline' }],
              },
            ],
          },
          {
            type: 'synopsis',
            content: [
              { type: 'text', text: '= ' },
              { type: 'text', text: 'Beat', marks: [{ type: 'bold' }] },
            ],
          },
        ],
      },
    });

    render(<EditorContent editor={editor} />);

    expect(editor.getHTML()).toContain('<strong>Bold</strong>');
    expect(editor.getHTML()).toContain('<em>italic</em>');
    expect(editor.getHTML()).toContain('<u>under</u>');
    expect(editor.getHTML()).toContain(
      '<p class="synopsis">= <strong>Beat</strong></p>',
    );

    editor.destroy();
  });
});
