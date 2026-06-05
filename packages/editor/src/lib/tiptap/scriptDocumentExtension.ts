import Document from '@tiptap/extension-document';

export const ScriptDocument = Document.extend({
  content:
    '(action | centeredText | sceneHeading | section | synopsis | note | character | parenthetical | dialogue | transition)+',
});
