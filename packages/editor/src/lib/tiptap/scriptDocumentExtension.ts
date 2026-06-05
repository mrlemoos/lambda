import Document from '@tiptap/extension-document';

export const ScriptDocument = Document.extend({
  content: '(action | sceneHeading | section | synopsis)+',
});
