function hasCommandModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

export function matchesAccelerator(
  event: KeyboardEvent,
  accelerator: string,
): boolean {
  const parts = accelerator.split('+');
  const key = parts[parts.length - 1] ?? '';
  const needsShift = parts.includes('Shift');
  const needsMeta = parts.includes('CmdOrCtrl') || parts.includes('Cmd');
  const metaPressed = hasCommandModifier(event);

  if (needsMeta !== metaPressed) {
    return false;
  }

  if (needsShift !== event.shiftKey) {
    return false;
  }

  return event.key.toLowerCase() === key.toLowerCase();
}

export function matchesZoomInShortcut(event: KeyboardEvent): boolean {
  if (!hasCommandModifier(event) || event.altKey) {
    return false;
  }

  return event.key === '=' || event.key === '+' || event.key === 'Add';
}

export function matchesZoomOutShortcut(event: KeyboardEvent): boolean {
  if (!hasCommandModifier(event) || event.altKey) {
    return false;
  }

  return event.key === '-' || event.key === 'Subtract';
}

export function matchesActualSizeShortcut(event: KeyboardEvent): boolean {
  return matchesAccelerator(event, 'CmdOrCtrl+0');
}
