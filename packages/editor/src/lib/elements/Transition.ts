const KNOWN_TRANSITIONS = [
  'FADE OUT.',
  'FADE OUT',
  'FADE OUT:',
  'CUT TO BLACK.',
] as const;

export function isTransition(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.startsWith('>')) {
    return true;
  }

  if (/TO:\s*$/i.test(trimmed)) {
    return true;
  }

  return KNOWN_TRANSITIONS.some((value) => text === value);
}
