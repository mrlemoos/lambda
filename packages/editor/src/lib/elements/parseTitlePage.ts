import { isSceneHeading } from './SceneHeading';
import { isTitlePage } from './TitlePage';
import { isTransition } from './Transition';

export type TitlePageData = {
  title: string[];
  credit?: string;
  author?: string[];
  source?: string;
  draftDate?: string;
  contact?: string[];
  notes?: string;
  copyright?: string;
};

const TITLE_PAGE_KEY = /^([A-Za-z][A-Za-z0-9 ]*):\s*(.*)$/;

function isTitlePageKeyLine(trimmed: string): boolean {
  return /^[A-Za-z][A-Za-z0-9 ]*:/.test(trimmed) && !isTransition(trimmed);
}

function stripInlineMarkup(text: string): string {
  return text
    .replace(/\\([*_])/g, '$1')
    .replace(/\*\*|\*|_/g, '')
    .trim();
}

function normaliseKey(key: string): string {
  return key.trim().toLowerCase();
}

function nextNonEmptyLineIndex(lines: string[], fromIndex: number): number {
  for (let index = fromIndex; index < lines.length; index += 1) {
    if (lines[index].trim()) {
      return index;
    }
  }

  return -1;
}

export type TitlePageSection = {
  titlePage: string[];
  bodyStartIndex: number;
};

export function extractTitlePageSection(lines: string[]): TitlePageSection {
  let startIndex = 0;

  while (startIndex < lines.length && lines[startIndex].trim() === '') {
    startIndex += 1;
  }

  if (startIndex >= lines.length) {
    return { titlePage: [], bodyStartIndex: lines.length };
  }

  const result: string[] = [];
  let inTitlePage = false;
  let bodyStartIndex = startIndex;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const previousLine = index > startIndex ? lines[index - 1] : undefined;

    if (!inTitlePage) {
      if (isTitlePage(line, previousLine)) {
        inTitlePage = true;
        result.push(line);
        bodyStartIndex = index + 1;
        continue;
      }

      break;
    }

    if (!trimmed) {
      const nextIndex = nextNonEmptyLineIndex(lines, index + 1);

      if (nextIndex === -1) {
        result.push(line);
        bodyStartIndex = index + 1;
        continue;
      }

      const nextTrimmed = lines[nextIndex].trim();

      if (isSceneHeading(nextTrimmed)) {
        bodyStartIndex = nextIndex;
        break;
      }

      if (isTitlePageKeyLine(nextTrimmed)) {
        result.push(line);
        bodyStartIndex = index + 1;
        continue;
      }

      bodyStartIndex = index;
      break;
    }

    if (isSceneHeading(trimmed)) {
      bodyStartIndex = index;
      break;
    }

    result.push(line);
    bodyStartIndex = index + 1;
  }

  return { titlePage: result, bodyStartIndex };
}

export function extractTitlePageLines(lines: string[]): string[] {
  return extractTitlePageSection(lines).titlePage;
}

export function parseTitlePageBlock(lines: string[]): TitlePageData {
  const data: TitlePageData = { title: [] };
  let currentKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const keyMatch = trimmed.match(TITLE_PAGE_KEY);

    if (keyMatch && !isTransition(trimmed)) {
      currentKey = normaliseKey(keyMatch[1]);
      const inlineValue = stripInlineMarkup(keyMatch[2]);

      if (inlineValue) {
        appendValue(data, currentKey, inlineValue);
      }

      continue;
    }

    if (currentKey && trimmed) {
      appendValue(data, currentKey, stripInlineMarkup(trimmed));
    }
  }

  return data;
}

export function parseTitlePage(lines: string[]): TitlePageData {
  return parseTitlePageBlock(extractTitlePageLines(lines));
}

function appendValue(data: TitlePageData, key: string, value: string): void {
  if (!value) {
    return;
  }

  switch (key) {
    case 'title':
      data.title.push(value);
      break;
    case 'credit':
      data.credit = value;
      break;
    case 'author':
    case 'authors':
      data.author = [...(data.author ?? []), value];
      break;
    case 'source':
      data.source = value;
      break;
    case 'draft date':
      data.draftDate = value;
      break;
    case 'contact':
      data.contact = [...(data.contact ?? []), value];
      break;
    case 'notes':
      data.notes = data.notes ? `${data.notes}\n${value}` : value;
      break;
    case 'copyright':
      data.copyright = value;
      break;
    default:
      break;
  }
}
