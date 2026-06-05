import { Extension } from '@tiptap/core';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { classifiedToNodeType } from './classifyBlockTypes';
import { classifyBlock, previousBlockContext } from './classifyBlock';

const normalizePluginKey = new PluginKey('normalizeScriptBlocks');

export function normalizeScriptDocumentTransaction(
  state: EditorState,
): Transaction | null {
  const { doc, schema } = state;
  let tr = state.tr;
  let changed = false;

  for (let index = doc.childCount - 1; index >= 0; index -= 1) {
    const node = doc.child(index);

    if (!node.isTextblock) {
      continue;
    }

    const text = node.textContent;

    if (text.trim().length === 0) {
      continue;
    }

    const classified = classifyBlock(text, previousBlockContext(doc, index));
    const targetName = classifiedToNodeType(classified);

    if (node.type.name === targetName) {
      continue;
    }

    const targetType = schema.nodes[targetName];

    if (!targetType) {
      continue;
    }

    let pos = 0;

    for (let childIndex = 0; childIndex < index; childIndex += 1) {
      pos += doc.child(childIndex).nodeSize;
    }

    tr = tr.setNodeMarkup(pos, targetType);
    changed = true;
  }

  return changed ? tr : null;
}

export const NormalizeScriptBlocks = Extension.create({
  name: 'normalizeScriptBlocks',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: normalizePluginKey,
        view(editorView) {
          queueMicrotask(() => {
            const transaction = normalizeScriptDocumentTransaction(
              editorView.state,
            );

            if (transaction) {
              editorView.dispatch(
                transaction.setMeta(normalizePluginKey, true),
              );
            }
          });

          return {};
        },
      }),
    ];
  },
});
