import type { JSONContent } from '@tiptap/core';
import {
  classifyBlock,
  extractTitlePageLines,
  type ClassifiedElement,
} from '@lambda/editor';

import {
  extractSluglineDocumentSettings,
  formatSluglineDocumentSettingsBlock,
  type FountainPageFormat,
} from './sluglineDocumentSettings.js';

export type { FountainPageFormat };

export type FountainScript = {
  titlePage: string[];
  document: JSONContent;
  sluglineSettings?: string[];
  pageFormat?: FountainPageFormat;
};

const BODY_NODE_TYPE: Partial<Record<ClassifiedElement, string>> = {
  action: 'action',
  'scene-heading': 'sceneHeading',
  section: 'section',
  synopsis: 'synopsis',
  note: 'note',
  'centered-text': 'centeredText',
  character: 'character',
  parenthetical: 'parenthetical',
  dialogue: 'dialogue',
  transition: 'transition',
};

export function parseFountain(source: string): FountainScript {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const titlePage = extractTitlePageLines(lines);
  const { bodyLines, sluglineSettings, pageFormat } =
    extractSluglineDocumentSettings(lines.slice(titlePage.length));

  const content: JSONContent[] = [];
  let previousLine: string | undefined;
  let previousNodeType: string | undefined;

  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      const separatesBodyContent = bodyLines
        .slice(index + 1)
        .some((nextLine) => nextLine.trim().length > 0);

      if (separatesBodyContent) {
        content.push({ ...EMPTY_ACTION_BLOCK });
      }

      previousLine = undefined;
      previousNodeType = undefined;
      continue;
    }

    const classifiedBlock = classifyBlock(trimmed, {
      previousLine,
      previousNodeType,
    });
    const classified =
      (classifiedBlock === 'character' || classifiedBlock === 'dialogue') &&
      previousNodeType === 'action' &&
      typeof previousLine === 'string' &&
      previousLine.trim().length > 0 &&
      !trimmed.startsWith('@')
        ? 'action'
        : classifiedBlock;

    if (!classified) {
      throw new Error(`Unrecognised line in script body: ${trimmed}`);
    }

    const followedByBlank =
      index + 1 < bodyLines.length && bodyLines[index + 1].trim().length === 0;
    const bodyClassified =
      classified === 'title-page' ||
      (classified === 'character' && followedByBlank)
        ? 'action'
        : classified;
    const nodeType = BODY_NODE_TYPE[bodyClassified];

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
    sluglineSettings,
    pageFormat: sluglineSettings ? pageFormat : undefined,
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

  for (const node of nodes) {
    if (!nodeHasText(node) && node.type !== 'action') {
      continue;
    }

    if (!nodeHasText(node)) {
      bodyLines.push('');
      continue;
    }

    bodyLines.push(stringifyNode(node));
  }

  return bodyLines;
}

function appendSluglineSettings(
  text: string,
  settingsLines: string[] | undefined,
): string {
  if (!settingsLines || settingsLines.length === 0) {
    return text;
  }

  const settingsBlock = `${formatSluglineDocumentSettingsBlock(settingsLines).join('\n')}\n`;

  if (text.length === 0) {
    return settingsBlock;
  }

  const normalized = text.endsWith('\n') ? text : `${text}\n`;
  const separator = normalized.endsWith('\n\n') ? '' : '\n';

  return `${normalized}${separator}${settingsBlock}`;
}

export function stringifyFountain(script: FountainScript): string {
  const bodyLines = stringifyBodyNodes(script.document.content ?? []);
  const hasTitlePage = script.titlePage.length > 0;
  const hasBody = bodyLines.some((line) => line.trim().length > 0);

  if (!hasTitlePage) {
    const hasBodyLines = bodyLines.length > 0;
    const bodyText = `${bodyLines.join('\n')}${hasBodyLines ? '\n' : ''}`;

    return appendSluglineSettings(bodyText, script.sluglineSettings);
  }

  if (!hasBody) {
    const titleText = script.titlePage.join('\n');
    const lastLine = script.titlePage.at(-1) ?? '';
    const base = lastLine.trim() === '' ? titleText : `${titleText}\n`;

    return appendSluglineSettings(base, script.sluglineSettings);
  }

  const titleText = script.titlePage.join('\n');
  const bodyText = bodyLines.join('\n');
  const separator = bodyLines[0] === '' ? '\n' : '\n\n';
  const base = `${titleText}${separator}${bodyText}\n`;

  return appendSluglineSettings(base, script.sluglineSettings);
}

function textNode(type: string, text: string): JSONContent {
  return {
    type,
    content: parseInlineFountain(text),
  };
}

type InlineMark = 'bold' | 'italic' | 'underline';
type InlineMarkJson = { type: InlineMark };

const MARKER_BY_TYPE: Record<InlineMark, string> = {
  bold: '**',
  italic: '*',
  underline: '_',
};

function marksFor(types: InlineMark[]): InlineMarkJson[] | undefined {
  if (types.length === 0) {
    return undefined;
  }

  return types.map((type) => ({ type }));
}

function sameMarks(left: InlineMark[], right: InlineMark[]): boolean {
  return (
    left.length === right.length &&
    left.every((type, index) => type === right[index])
  );
}

function parseInlineFountain(text: string): JSONContent[] {
  const nodes: JSONContent[] = [];
  let buffer = '';
  let bufferMarks: InlineMark[] = [];
  const activeMarks: InlineMark[] = [];

  function flush() {
    if (!buffer) {
      return;
    }

    const node: JSONContent = {
      type: 'text',
      text: buffer,
    };
    const marks = marksFor(bufferMarks);

    if (marks) {
      node.marks = marks;
    }

    nodes.push(node);
    buffer = '';
  }

  function append(value: string) {
    if (!sameMarks(bufferMarks, activeMarks)) {
      flush();
      bufferMarks = [...activeMarks];
    }

    buffer += value;
  }

  function toggle(type: InlineMark) {
    flush();

    const index = activeMarks.indexOf(type);

    if (index === -1) {
      activeMarks.push(type);
    } else {
      activeMarks.splice(index, 1);
    }

    bufferMarks = [...activeMarks];
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '\\' && (next === '*' || next === '_')) {
      append(next);
      index += 1;
      continue;
    }

    if (text.startsWith('**', index)) {
      toggle('bold');
      index += 1;
      continue;
    }

    if (char === '*') {
      toggle('italic');
      continue;
    }

    if (char === '_') {
      toggle('underline');
      continue;
    }

    append(char);
  }

  flush();

  return nodes;
}

function stringifyNode(node: JSONContent): string {
  if (node.type === 'text') {
    return stringifyTextNode(node);
  }

  return (node.content ?? [])
    .map((child) => {
      return stringifyNode(child);
    })
    .join('');
}

function stringifyTextNode(node: JSONContent): string {
  let text = node.text ?? '';
  const marks = (node.marks ?? [])
    .map((mark) => mark.type)
    .filter((type): type is InlineMark => type in MARKER_BY_TYPE);

  for (let index = marks.length - 1; index >= 0; index -= 1) {
    const marker = MARKER_BY_TYPE[marks[index]];
    text = `${marker}${text}${marker}`;
  }

  return text;
}
