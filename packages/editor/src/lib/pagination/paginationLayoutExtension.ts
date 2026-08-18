import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import type { BlockPlacement } from './types';

export const paginationLayoutPluginKey = new PluginKey('paginationLayout');

const PAGINATION_BLOCK_TYPES = new Set([
  'action',
  'centeredText',
  'sceneHeading',
  'section',
  'synopsis',
  'note',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
]);

export const SPLIT_DIALOGUE_CONTINUATION_TEXT = "(CONT'D)";

export function createSplitDialogueContinuationElement(
  characterName: string,
): HTMLElement {
  const element = document.createElement('p');
  element.className = 'character split-dialogue-continuation';
  element.textContent = `${characterName} ${SPLIT_DIALOGUE_CONTINUATION_TEXT}`;
  return element;
}

export function buildPaginationDecorations(
  doc: ProseMirrorNode,
  placements: BlockPlacement[],
): DecorationSet {
  const decorations: Decoration[] = [];
  const blocks: { node: ProseMirrorNode; offset: number }[] = [];

  doc.forEach((node, offset) => {
    if (!PAGINATION_BLOCK_TYPES.has(node.type.name)) {
      return;
    }

    blocks.push({ node, offset });
  });

  for (let index = 0; index < blocks.length; index += 1) {
    const { node, offset } = blocks[index];
    const placement = placements[index];

    if (node.type.name !== 'dialogue' || !placement?.pageStarts?.length) {
      continue;
    }

    const previous = blocks[index - 1];

    if (!previous || previous.node.type.name !== 'character') {
      continue;
    }

    const characterName = previous.node.textContent.trim();

    if (!characterName) {
      continue;
    }

    for (const pageStart of placement.pageStarts) {
      decorations.push(
        Decoration.widget(
          offset + 1 + pageStart.textOffset,
          () => createSplitDialogueContinuationElement(characterName),
          {
            side: -1,
            key: `split-dialogue-${index}-${pageStart.textOffset}`,
          },
        ),
      );
    }
  }

  return DecorationSet.create(doc, decorations);
}

function createPaginationLayoutPlugin(): Plugin {
  return new Plugin({
    key: paginationLayoutPluginKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(transaction, decorationSet, _oldState, newState) {
        const placements = transaction.getMeta(paginationLayoutPluginKey) as
          | BlockPlacement[]
          | undefined;

        if (placements) {
          return buildPaginationDecorations(newState.doc, placements);
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },
    props: {
      decorations(state) {
        return paginationLayoutPluginKey.getState(state);
      },
    },
  });
}

export const PaginationLayout = Extension.create({
  name: 'paginationLayout',

  addProseMirrorPlugins() {
    return [createPaginationLayoutPlugin()];
  },
});
