export function isCenteredText(text: string): boolean {
  const trimmed = text.trim();

  return trimmed.startsWith('>') && trimmed.endsWith('<') && trimmed.length > 2;
}
