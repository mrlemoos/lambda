import { Extension } from '@tiptap/core';

import { classifyLine, type ClassifiedElement } from '../ClassifyLine';

function classifiedToNodeType(classified: ClassifiedElement | null): string {
  switch (classified) {
    case 'scene-heading':
      return 'sceneHeading';
    case 'section':
      return 'section';
    case 'synopsis':
      return 'synopsis';
    default:
      return 'action';
  }
}

function blockPosAtSelection(selection: {
  $from: { depth: number; before: (depth: number) => number };
}): number {
  return selection.$from.before(selection.$from.depth);
}

export const ClassifyOnEnter = Extension.create({
  name: 'classifyOnEnter',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection, schema } = state;
        const { $from } = selection;
        const text = $from.parent.textContent;
        const blockIndex = $from.index(1);
        const previousLine =
          blockIndex === 0
            ? undefined
            : state.doc.child(blockIndex - 1).textContent;
        const classified = classifyLine(text, previousLine);
        const nodeTypeName = classifiedToNodeType(classified);
        const classifiedType = schema.nodes[nodeTypeName];
        const actionType = schema.nodes.action;
        const currentBlockPos = blockPosAtSelection(selection);

        return editor
          .chain()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              tr.setNodeMarkup(currentBlockPos, classifiedType);
            }

            return true;
          })
          .splitBlock()
          .command(({ tr, state: updatedState, dispatch }) => {
            if (!dispatch) {
              return true;
            }

            const newBlockPos = blockPosAtSelection(updatedState.selection);

            tr.setNodeMarkup(newBlockPos, actionType);

            return true;
          })
          .run();
      },
    };
  },
});
