import Paragraph from '@tiptap/extension-paragraph';
import { mergeAttributes } from '@tiptap/core';

export const Action = Paragraph.extend({
  name: 'action',

  parseHTML() {
    return [{ tag: 'p.action' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'action' }), 0];
  },
});
