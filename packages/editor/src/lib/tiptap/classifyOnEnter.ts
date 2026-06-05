import { Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

import {
  blockIndexInDocument,
  classifyBlock,
  previousBlockContext,
  textblockDepth,
} from './classifyBlock';
import {
  classifiedToNextBlockType,
  classifiedToNodeType,
} from './classifyBlockTypes';

export const ClassifyOnEnter = Extension.create({
  name: 'classifyOnEnter',
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, schema } = editor;
        const { selection } = state;
        const { $from } = selection;
        const text = $from.parent.textContent;
        const blockIndex = blockIndexInDocument($from);
        const classified = classifyBlock(
          text,
          previousBlockContext(state.doc, blockIndex),
        );
        const classifiedType = schema.nodes[classifiedToNodeType(classified)];
        const nextBlockType =
          schema.nodes[classifiedToNextBlockType(classified)];
        const depth = textblockDepth($from);
        const currentBlockPos = $from.before(depth);
        const currentNode = $from.parent;

        return editor
          .chain()
          .command(({ tr, dispatch }) => {
            if (!dispatch) {
              return true;
            }

            tr.setNodeMarkup(currentBlockPos, classifiedType);

            const insertPos = currentBlockPos + currentNode.nodeSize;
            const newNode = nextBlockType.create();

            tr.insert(insertPos, newNode);
            tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));

            return true;
          })
          .run();
      },
    };
  },
});
