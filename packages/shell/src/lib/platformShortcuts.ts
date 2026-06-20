function isApplePlatform(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
  );
}

export function platformModifierKey(): string {
  return isApplePlatform() ? '⌘' : 'Ctrl';
}

export function formatPlatformShortcut(accelerator: string): string {
  const modifier = platformModifierKey();
  const isMac = modifier === '⌘';

  return accelerator
    .replaceAll('CmdOrCtrl', modifier)
    .replaceAll('Shift', isMac ? '⇧' : 'Shift')
    .replaceAll('+', isMac ? '' : '+');
}
