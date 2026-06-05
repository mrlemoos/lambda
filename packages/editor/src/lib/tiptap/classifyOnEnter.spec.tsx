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
  it('opens a dialogue block after Enter on a character cue', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent(
      '<p class="scene-heading">INT. KITCHEN - DAY</p><p class="action">STEEL</p>',
    );
    editor.commands.focus('end');

    pressEnter(editor);

    expect(editor.getHTML()).toContain('class="character"');
    expect(editor.getHTML()).toContain('class="dialogue"');

    editor.destroy();
  });

  it('opens an action block after Enter on dialogue', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent(
      '<p class="character">STEEL</p><p class="dialogue">Hello?</p>',
    );
    editor.commands.focus('end');

    pressEnter(editor);

    expect(editor.getHTML()).toMatch(/class="dialogue"[^>]*>[^<]*Hello\?/);
    expect(editor.getHTML()).toMatch(/class="action"[^>]*>\s*<\/p>/);

    editor.destroy();
  });

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
