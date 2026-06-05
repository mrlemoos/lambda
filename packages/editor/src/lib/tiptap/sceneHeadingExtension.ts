import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const SceneHeading = Paragraph.extend({
  name: 'sceneHeading',

  parseHTML() {
    return [{ tag: 'p.scene-heading', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, { class: 'scene-heading' }),
      0,
    ];
  },
});
