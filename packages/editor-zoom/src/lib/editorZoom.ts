export const MIN_EDITOR_ZOOM = 50;
export const MAX_EDITOR_ZOOM = 200;
export const EDITOR_ZOOM_STEP = 10;
export const ACTUAL_SIZE_ZOOM = 100;

export type EditorZoomAction = 'in' | 'out' | 'actual-size';

export function clampEditorZoom(level: number): number {
  return Math.min(MAX_EDITOR_ZOOM, Math.max(MIN_EDITOR_ZOOM, level));
}

export function adjustEditorZoom(
  currentLevel: number,
  action: EditorZoomAction,
): number {
  if (action === 'actual-size') {
    return ACTUAL_SIZE_ZOOM;
  }

  const delta = action === 'in' ? EDITOR_ZOOM_STEP : -EDITOR_ZOOM_STEP;

  return clampEditorZoom(currentLevel + delta);
}

export function formatZoomReadout(level: number): string {
  return `${level}%`;
}
