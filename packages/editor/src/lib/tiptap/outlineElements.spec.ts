import { describe, expect, it } from 'vitest';

import { createScriptEditor } from './useScriptEditor';

describe('outline element nodes', () => {
  it('preserves section and synopsis classes when loading HTML', () => {
    const editor = createScriptEditor();

    editor.commands.setContent(
      [
        "<p class='section'># Act I</p>",
        "<p class='synopsis'>= Brick and Steel come out of retirement.</p>",
      ].join(''),
    );

    const html = editor.getHTML();

    expect(html).toContain('class="section"');
    expect(html).toContain('class="synopsis"');

    editor.destroy();
  });
});
