import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { getCenteredTextSuffixLength } from '../elements/CenteredText';
import { getForcedPrefixLength } from '../elements/forcedPrefix';

const forcedPrefixHighlightKey = new PluginKey('forcedPrefixHighlight');

function buildForcedPrefixDecorations(doc: ProseMirrorNode): Decoration[] {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return;
    }

    const prefixLength = getForcedPrefixLength(node.textContent);

    if (prefixLength > 0) {
      const from = pos + 1;
      const to = from + prefixLength;

      decorations.push(Decoration.inline(from, to, { class: 'forced-prefix' }));
    }

    const suffixLength = getCenteredTextSuffixLength(node.textContent);

    if (suffixLength > 0) {
      const trimmedEnd = node.textContent.trimEnd();
      const from = pos + 1 + trimmedEnd.length - suffixLength;
      const to = from + suffixLength;

      decorations.push(Decoration.inline(from, to, { class: 'forced-prefix' }));
    }
  });

  return decorations;
}

export const ForcedPrefixHighlight = Extension.create({
  name: 'forcedPrefixHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: forcedPrefixHighlightKey,
        props: {
          decorations(state) {
            return DecorationSet.create(
              state.doc,
              buildForcedPrefixDecorations(state.doc),
            );
          },
        },
      }),
    ];
  },
});
