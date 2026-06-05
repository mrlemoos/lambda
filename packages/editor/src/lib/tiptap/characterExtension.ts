import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Character = Paragraph.extend({
  name: 'character',

  parseHTML() {
    return [{ tag: 'p.character' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'character' }), 0];
  },
});
