import { render } from '@testing-library/react';
import { EditorContent } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createScriptEditor } from './useScriptEditor';

describe('forcedPrefixHighlight', () => {
  it('greys the forced scene heading period in the editor', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent(
      '<p class="scene-heading">.SNIPER SCOPE POV</p>',
    );

    const prefix = document.querySelector('.forced-prefix');

    expect(prefix).toHaveTextContent('.');

    editor.destroy();
  });

  it('does not grey periods that are not forced prefixes', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent(
      '<p class="scene-heading">INT. KITCHEN - DAY</p>',
    );

    const prefix = document.querySelector('.forced-prefix');

    expect(prefix).toBeNull();

    editor.destroy();
  });

  it('greys the closing bracket on centred text', () => {
    const editor = createScriptEditor();

    render(<EditorContent editor={editor} />);

    editor.commands.setContent(
      '<p class="centered-text">&gt; THE END &lt;</p>',
    );

    const prefixes = document.querySelectorAll('.forced-prefix');

    expect(prefixes).toHaveLength(2);
    expect(prefixes[0]).toHaveTextContent('>');
    expect(prefixes[1]).toHaveTextContent('<');

    editor.destroy();
  });
});
