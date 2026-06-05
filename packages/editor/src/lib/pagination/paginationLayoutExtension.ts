import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import type { BlockPlacement } from './types';

export const paginationLayoutPluginKey = new PluginKey('paginationLayout');

const SCRIPT_BLOCK_TYPES = new Set([
  'action',
  'sceneHeading',
  'section',
  'synopsis',
  'note',
]);

export function buildPaginationDecorations(
  doc: ProseMirrorNode,
  placements: BlockPlacement[],
): DecorationSet {
  const decorations: Decoration[] = [];
  let blockIndex = 0;

  doc.forEach((node, pos) => {
    if (!node.isBlock || !SCRIPT_BLOCK_TYPES.has(node.type.name)) {
      return;
    }

    const placement = placements[blockIndex];
    blockIndex += 1;

    if (!placement || placement.marginTopPt <= 0) {
      return;
    }

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: 'pagination-page-start',
        style: `margin-top: ${placement.marginTopPt}pt !important`,
      }),
    );
  });

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
