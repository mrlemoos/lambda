export function isCenteredText(text: string): boolean {
  const trimmed = text.trim();

  return trimmed.startsWith('>') && trimmed.endsWith('<') && trimmed.length > 2;
}

/** Length of the trailing Fountain closing marker on centred text lines. */
export function getCenteredTextSuffixLength(text: string): number {
  if (!isCenteredText(text.trim())) {
    return 0;
  }

  const trimmedEnd = text.trimEnd();

  return trimmedEnd.endsWith('<') ? 1 : 0;
}

/** Visible centred content for pagination and print (omits Fountain bracket markers). */
export function centeredTextPrintText(text: string): string {
  const trimmed = text.trim();

  if (!isCenteredText(trimmed)) {
    return text;
  }

  return trimmed.slice(1, -1).trim();
}
