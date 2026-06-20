function isUpperCased(value: string): boolean {
  return value === value.toUpperCase();
}

export function isCharacter(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.startsWith('!')) {
    return false;
  }

  if (trimmed.startsWith('>') || trimmed.endsWith('.')) {
    return false;
  }

  if (trimmed.startsWith('@')) {
    return true;
  }

  const namePart = trimmed.split('(')[0]?.trim() ?? '';

  if (!/[A-Za-z]/.test(namePart)) {
    return false;
  }

  return isUpperCased(namePart);
}
