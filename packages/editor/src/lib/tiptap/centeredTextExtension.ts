import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const CenteredText = Paragraph.extend({
  name: 'centeredText',

  parseHTML() {
    return [{ tag: 'p.centered-text', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, { class: 'centered-text' }),
      0,
    ];
  },
});
