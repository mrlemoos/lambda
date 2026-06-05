import type { JSONContent } from '@tiptap/core';

import type { ScriptBlock, ScriptElementType } from './types';

const NODE_TYPE_MAP: Record<string, ScriptElementType | undefined> = {
  action: 'action',
  sceneHeading: 'sceneHeading',
  section: 'section',
  synopsis: 'synopsis',
};

function nodeText(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }

  return (node.content ?? []).map((child) => nodeText(child)).join('');
}

export function serializeTipTapDocument(doc: JSONContent): ScriptBlock[] {
  const blocks: ScriptBlock[] = [];

  for (const node of doc.content ?? []) {
    const type = NODE_TYPE_MAP[node.type ?? ''];

    if (!type) {
      continue;
    }

    blocks.push({
      type,
      text: nodeText(node),
    });
  }

  return blocks;
}
