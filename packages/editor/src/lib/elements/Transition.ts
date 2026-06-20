export function isTransition(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.startsWith('>') && trimmed.endsWith('<')) {
    return false;
  }

  if (trimmed.startsWith('>')) {
    return trimmed === trimmed.toUpperCase();
  }

  return trimmed.endsWith(':') && trimmed === trimmed.toUpperCase();
}
