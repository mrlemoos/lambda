import { ACTUAL_SIZE_ZOOM, clampEditorZoom } from './editorZoom.js';

export const EDITOR_ZOOM_STORAGE_KEY = 'lambda-editor-zoom';

export function readStoredEditorZoom(
  storage: Pick<Storage, 'getItem'>,
): number {
  const raw = storage.getItem(EDITOR_ZOOM_STORAGE_KEY);

  if (raw === null) {
    return ACTUAL_SIZE_ZOOM;
  }

  const parsed = Number.parseInt(raw, 10);

  if (Number.isNaN(parsed)) {
    return ACTUAL_SIZE_ZOOM;
  }

  return clampEditorZoom(parsed);
}

export function writeStoredEditorZoom(
  storage: Pick<Storage, 'setItem'>,
  level: number,
): void {
  storage.setItem(EDITOR_ZOOM_STORAGE_KEY, String(clampEditorZoom(level)));
}

export function getEditorZoomStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    const { localStorage } = globalThis;

    if (
      localStorage &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function'
    ) {
      return localStorage;
    }
  } catch {
    // Access can fail in private browsing or test environments.
  }

  return {
    getItem: () => null,
    setItem: () => undefined,
  };
}
