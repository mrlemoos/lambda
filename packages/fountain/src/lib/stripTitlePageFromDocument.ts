import type { JSONContent } from '@tiptap/core';

const EMPTY_ACTION_BLOCK: JSONContent = {
  type: 'action',
};

function ensureEditableDocument(document: JSONContent): JSONContent {
  const content = document.content ?? [];

  if (content.length > 0) {
    return document;
  }

  return {
    ...document,
    content: [EMPTY_ACTION_BLOCK],
  };
}

function nodeText(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }

  return (node.content ?? []).map((child) => nodeText(child)).join('');
}

function linesMatchTitlePageLine(
  node: JSONContent,
  titlePageLine: string,
): boolean {
  if (node.type !== 'action') {
    return false;
  }

  if (titlePageLine.trim() === '') {
    return nodeText(node).trim() === '';
  }

  return nodeText(node).trim() === titlePageLine.trim();
}

export function stripTitlePageFromDocument(
  document: JSONContent,
  titlePageLines: string[],
): JSONContent {
  if (titlePageLines.length === 0) {
    return document;
  }

  const content = [...(document.content ?? [])];
  let titleIndex = 0;

  while (titleIndex < titlePageLines.length && content.length > 0) {
    const titleLine = titlePageLines[titleIndex] ?? '';
    const node = content[0];

    if (titleLine.trim() === '') {
      titleIndex += 1;

      if (node && linesMatchTitlePageLine(node, titleLine)) {
        content.shift();
      }

      continue;
    }

    if (!node || !linesMatchTitlePageLine(node, titleLine)) {
      break;
    }

    content.shift();
    titleIndex += 1;
  }

  return ensureEditableDocument({
    ...document,
    content,
  });
}
