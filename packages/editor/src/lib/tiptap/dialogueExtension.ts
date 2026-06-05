import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Dialogue = Paragraph.extend({
  name: 'dialogue',

  parseHTML() {
    return [{ tag: 'p.dialogue' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'dialogue' }), 0];
  },
});
