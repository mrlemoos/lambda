import { isTransition } from './Transition';

const TITLE_PAGE_KEY = /^[A-Za-z][A-Za-z0-9 ]*:/;

export function isTitlePage(text: string, previousLine?: string): boolean {
  const trimmed = text.trim();

  if (TITLE_PAGE_KEY.test(trimmed) && !isTransition(trimmed)) {
    return true;
  }

  if (typeof previousLine === 'string' && /^\s{2,}\S/.test(text)) {
    const previousTrimmed = previousLine.trim();

    if (
      TITLE_PAGE_KEY.test(previousTrimmed) &&
      !isTransition(previousTrimmed)
    ) {
      return true;
    }

    return /^\s{2,}\S/.test(previousLine);
  }

  return false;
}
