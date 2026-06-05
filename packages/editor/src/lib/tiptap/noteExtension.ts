import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Note = Paragraph.extend({
  name: 'note',

  parseHTML() {
    return [{ tag: 'p.note' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'note' }), 0];
  },
});
