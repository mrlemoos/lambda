import { render } from '@testing-library/react';
import { EditorContent } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';
import { describe, expect, it } from 'vitest';

import { classifyLine } from '../ClassifyLine';
import { createScriptEditor } from './useScriptEditor';

function pressEnter(editor: ReturnType<typeof createScriptEditor>) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });

  return editor.view.someProp(
    'handleKeyDown',
    (handler: (view: EditorView, event: KeyboardEvent) => boolean | void) =>
      handler(editor.view, event),
  );
}

describe('classifyOnEnter keyboard shortcut', () => {
  it('sets scene heading node type when Enter is pressed', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent('<p class="action">INT. KITCHEN - DAY</p>');
    editor.commands.focus('end');

    const classified = classifyLine('INT. KITCHEN - DAY');

    expect(classified).toBe('scene-heading');

    const handled = pressEnter(editor);

    expect(handled).toBe(true);
    expect(editor.getHTML()).toContain('class="scene-heading"');

    editor.destroy();
  });
});
