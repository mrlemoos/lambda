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

function stripInlineMarkup(text: string): string {
  return text
    .replace(/\\([*_])/g, '$1')
    .replace(/\*\*|\*|_/g, '')
    .trim();
}

function normaliseKey(key: string): string {
  return key.toLowerCase();
}

function nextNonEmptyLineIndex(lines: string[], fromIndex: number): number {
  for (let index = fromIndex; index < lines.length; index += 1) {
    if (lines[index].trim()) {
      return index;
    }
  }

  return -1;
}

export function extractTitlePageLines(lines: string[]): string[] {
  const result: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const previousLine = index > 0 ? lines[index - 1] : undefined;
    const trimmed = line.trim();

    if (isTitlePage(line, previousLine)) {
      result.push(line);
      continue;
    }

    if (!trimmed && result.length > 0) {
      const nextIndex = nextNonEmptyLineIndex(lines, index + 1);

      if (nextIndex === -1) {
        result.push(line);
        continue;
      }

      const nextPrevious = nextIndex > 0 ? lines[nextIndex - 1] : undefined;

      if (isTitlePage(lines[nextIndex], nextPrevious)) {
        result.push(line);
        continue;
      }

      break;
    }

    if (result.length > 0) {
      break;
    }
  }

  return result;
}

export function parseTitlePage(lines: string[]): TitlePageData {
  const block = extractTitlePageLines(lines);
  const data: TitlePageData = { title: [] };
  let currentKey: string | null = null;

  for (const line of block) {
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

    if (/^\s{2,}\S/.test(line) && currentKey) {
      appendValue(data, currentKey, stripInlineMarkup(trimmed));
    }
  }

  return data;
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
