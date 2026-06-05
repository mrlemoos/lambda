import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Synopsis = Paragraph.extend({
  name: 'synopsis',

  parseHTML() {
    return [{ tag: 'p.synopsis', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'synopsis' }), 0];
  },
});
