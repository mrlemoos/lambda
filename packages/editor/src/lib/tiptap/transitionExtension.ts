import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Transition = Paragraph.extend({
  name: 'transition',

  parseHTML() {
    return [{ tag: 'p.transition' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'transition' }), 0];
  },
});
