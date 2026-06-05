import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ResolvedPos } from '@tiptap/pm/model';

import { classifyLine, type ClassifiedElement } from '../ClassifyLine';
import { isCharacter } from '../elements/Character';
import { isParenthetical } from '../elements/Parenthetical';
import { isSceneHeading } from '../elements/SceneHeading';
import { isTransition } from '../elements/Transition';

export type ClassifyBlockContext = {
  previousLine?: string;
  previousNodeType?: string;
};

/** Empty blocks that still imply the next line belongs to the same speech cue. */
const CUE_CONTEXT_TYPES = new Set(['character', 'parenthetical']);

export function previousBlockContext(
  doc: ProseMirrorNode,
  blockIndex: number,
): ClassifyBlockContext {
  if (blockIndex <= 0) {
    return {};
  }

  for (let index = blockIndex - 1; index >= 0; index -= 1) {
    const node = doc.child(index);
    const text = node.textContent;
    const nodeType = node.type.name;

    if (text.trim().length > 0) {
      return { previousLine: text, previousNodeType: nodeType };
    }

    if (CUE_CONTEXT_TYPES.has(nodeType)) {
      return { previousLine: text, previousNodeType: nodeType };
    }

    if (nodeType === 'dialogue') {
      continue;
    }

    return {};
  }

  return {};
}

/** Depth of the textblock node that contains the cursor. */
export function textblockDepth($from: ResolvedPos): number {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).isTextblock) {
      return depth;
    }
  }

  return $from.depth;
}

export function blockIndexInDocument($from: ResolvedPos): number {
  const depth = textblockDepth($from);

  return $from.index(depth - 1);
}

export function classifyBlock(
  text: string,
  context: ClassifyBlockContext = {},
): ClassifiedElement | null {
  const { previousLine, previousNodeType } = context;
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (
    previousNodeType === 'character' ||
    previousNodeType === 'parenthetical'
  ) {
    if (isSceneHeading(text) || isTransition(text)) {
      return classifyLine(text, previousLine);
    }

    if (isCharacter(text)) {
      return 'character';
    }

    if (isParenthetical(text)) {
      return 'parenthetical';
    }

    return 'dialogue';
  }

  if (
    previousNodeType === 'action' &&
    typeof previousLine === 'string' &&
    previousLine.trim().length > 0
  ) {
    const classified = classifyLine(text, previousLine);

    if (
      (classified === 'character' || classified === 'dialogue') &&
      !trimmed.startsWith('@')
    ) {
      return 'action';
    }

    return classified;
  }

  if (previousNodeType === 'dialogue') {
    if (isSceneHeading(text) || isTransition(text)) {
      return classifyLine(text, previousLine);
    }

    if (isCharacter(text)) {
      return 'character';
    }

    if (isParenthetical(text)) {
      return 'parenthetical';
    }

    return 'action';
  }

  return classifyLine(text, previousLine);
}
