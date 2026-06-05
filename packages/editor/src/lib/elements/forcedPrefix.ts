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
