import type { JSONContent } from '@tiptap/core';
import {
  classifyBlock,
  extractTitlePageLines,
  type ClassifiedElement,
} from '@lambda/editor';

export type FountainScript = {
  titlePage: string[];
  document: JSONContent;
};

const BODY_NODE_TYPE: Partial<Record<ClassifiedElement, string>> = {
  action: 'action',
  'scene-heading': 'sceneHeading',
  section: 'section',
  synopsis: 'synopsis',
  note: 'note',
  character: 'character',
  parenthetical: 'parenthetical',
  dialogue: 'dialogue',
  transition: 'transition',
};

export function parseFountain(source: string): FountainScript {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const titlePage = extractTitlePageLines(lines);
  const bodyLines = lines.slice(titlePage.length);

  const content: JSONContent[] = [];
  let previousLine: string | undefined;
  let previousNodeType: string | undefined;

  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const classified = classifyBlock(trimmed, {
      previousLine,
      previousNodeType,
    });

    if (!classified || classified === 'title-page') {
      throw new Error(`Unrecognised line in script body: ${trimmed}`);
    }

    const nodeType = BODY_NODE_TYPE[classified];

    if (!nodeType) {
      throw new Error(`Unsupported element in script body: ${classified}`);
    }

    content.push(textNode(nodeType, trimmed));
    previousLine = trimmed;
    previousNodeType = nodeType;
  }

  return {
    titlePage,
    document: ensureEditableDocument({
      type: 'doc',
      content,
    }),
  };
}

const EMPTY_ACTION_BLOCK: JSONContent = {
  type: 'action',
};

/** TipTap ScriptDocument requires at least one body block to accept input. */
export function ensureEditableDocument(document: JSONContent): JSONContent {
  const content = document.content ?? [];

  if (content.length > 0) {
    return document;
  }

  return {
    ...document,
    content: [EMPTY_ACTION_BLOCK],
  };
}

function nodeHasText(node: JSONContent): boolean {
  return stringifyNode(node).trim().length > 0;
}

function stringifyBodyNodes(nodes: JSONContent[]): string[] {
  const bodyLines: string[] = [];
  let previousType: string | undefined;

  for (const node of nodes) {
    if (!nodeHasText(node)) {
      continue;
    }

    const needsBlankLineBefore =
      bodyLines.length > 0 &&
      (node.type === 'sceneHeading' ||
        node.type === 'transition' ||
        (node.type === 'character' && previousType === 'sceneHeading'));

    if (needsBlankLineBefore) {
      bodyLines.push('');
    }

    bodyLines.push(stringifyNode(node));
    previousType = node.type;
  }

  return bodyLines;
}

export function stringifyFountain(script: FountainScript): string {
  const bodyLines = stringifyBodyNodes(script.document.content ?? []);
  const hasTitlePage = script.titlePage.length > 0;
  const hasBody = bodyLines.length > 0;

  if (!hasTitlePage) {
    return `${bodyLines.join('\n')}${hasBody ? '\n' : ''}`;
  }

  if (!hasBody) {
    const titleText = script.titlePage.join('\n');
    const lastLine = script.titlePage.at(-1) ?? '';

    return lastLine.trim() === '' ? titleText : `${titleText}\n`;
  }

  return `${script.titlePage.join('\n')}\n\n${bodyLines.join('\n')}\n`;
}

function textNode(type: string, text: string): JSONContent {
  return {
    type,
    content: [{ type: 'text', text }],
  };
}

function stringifyNode(node: JSONContent): string {
  return (node.content ?? [])
    .map((child) => {
      if (child.type === 'text') {
        return child.text ?? '';
      }

      return stringifyNode(child);
    })
    .join('');
}
