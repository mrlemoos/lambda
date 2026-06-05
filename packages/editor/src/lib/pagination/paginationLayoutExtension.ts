import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';

import type { BlockPlacement } from './types';

export const paginationLayoutPluginKey = new PluginKey('paginationLayout');

export function buildPaginationDecorations(
  doc: ProseMirrorNode,
  placements: BlockPlacement[],
): DecorationSet {
  void doc;
  void placements;

  return DecorationSet.empty;
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
