import { centeredTextPrintText } from './CenteredText';

const FORCED_SCENE_HEADING = /^\.[A-Za-z0-9]/;

const FORCED_PREFIXES = ['@', '>', '!', '~'] as const;

export function getForcedPrefixLength(text: string): number {
  if (FORCED_SCENE_HEADING.test(text)) {
    return 1;
  }

  const trimmed = text.trimStart();
  const leadingWhitespace = text.length - trimmed.length;

  for (const prefix of FORCED_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return leadingWhitespace + 1;
    }
  }

  return 0;
}

/** Visible text for preview/print (omits Fountain force-syntax markers). */
export function fountainPrintText(text: string): string {
  const centered = centeredTextPrintText(text);

  if (centered !== text) {
    return centered;
  }

  const prefixLength = getForcedPrefixLength(text);

  if (prefixLength > 0) {
    return text.slice(prefixLength);
  }

  return text;
}
