import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const Section = Paragraph.extend({
  name: 'section',

  parseHTML() {
    return [{ tag: 'p.section', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'section' }), 0];
  },
});
