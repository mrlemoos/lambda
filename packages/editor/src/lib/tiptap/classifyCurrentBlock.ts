import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { normalizeScriptDocumentTransaction } from './normalizeScriptBlocks';

const classifyPluginKey = new PluginKey('classifyCurrentBlock');

export const ClassifyCurrentBlock = Extension.create({
  name: 'classifyCurrentBlock',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: classifyPluginKey,
        appendTransaction(transactions, oldState, newState) {
          const docChanged = transactions.some(
            (transaction) =>
              transaction.docChanged && !transaction.getMeta(classifyPluginKey),
          );

          if (!docChanged) {
            return null;
          }

          const transaction = normalizeScriptDocumentTransaction(newState);

          if (!transaction) {
            return null;
          }

          return transaction.setMeta(classifyPluginKey, true);
        },
      }),
    ];
  },
});
