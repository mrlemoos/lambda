import { Mark, mergeAttributes } from '@tiptap/core';

export const Bold = Mark.create({
  name: 'bold',

  parseHTML() {
    return [{ tag: 'strong' }, { tag: 'b' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['strong', mergeAttributes(HTMLAttributes), 0];
  },
});

export const Italic = Mark.create({
  name: 'italic',

  parseHTML() {
    return [{ tag: 'em' }, { tag: 'i' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['em', mergeAttributes(HTMLAttributes), 0];
  },
});

export const Underline = Mark.create({
  name: 'underline',

  parseHTML() {
    return [{ tag: 'u' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(HTMLAttributes), 0];
  },
});
