import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Parenthetical = Paragraph.extend({
  name: 'parenthetical',

  parseHTML() {
    return [{ tag: 'p.parenthetical' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, { class: 'parenthetical' }),
      0,
    ];
  },
});
