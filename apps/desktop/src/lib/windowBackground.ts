const MACOS_TRANSPARENT_WINDOW = '#00000000';

/** Matches non-macOS `--app-page` in `renderer/styles.css`. */
export function resolveWindowBackgroundColor(
  shouldUseDarkColors: boolean,
  platform: NodeJS.Platform = process.platform,
): string {
  if (platform === 'darwin') {
    return MACOS_TRANSPARENT_WINDOW;
  }

  return shouldUseDarkColors ? '#000000' : '#e8e8ec';
}
