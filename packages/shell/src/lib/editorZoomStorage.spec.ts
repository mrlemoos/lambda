import { describe, expect, it } from 'vitest';

import {
  EDITOR_ZOOM_STORAGE_KEY,
  readStoredEditorZoom,
  writeStoredEditorZoom,
} from './editorZoomStorage.js';
import { ACTUAL_SIZE_ZOOM } from './editorZoom.js';

describe('editorZoomStorage', () => {
  it('returns actual size when nothing is stored', () => {
    const storage = createMemoryStorage();

    const result = readStoredEditorZoom(storage);

    expect(result).toBe(ACTUAL_SIZE_ZOOM);
  });

  it('persists a clamped zoom level', () => {
    const storage = createMemoryStorage();

    writeStoredEditorZoom(storage, 130);

    const result = readStoredEditorZoom(storage);

    expect(result).toBe(130);
    expect(storage.getItem(EDITOR_ZOOM_STORAGE_KEY)).toBe('130');
  });

  it('clamps invalid stored values', () => {
    const storage = createMemoryStorage();
    storage.setItem(EDITOR_ZOOM_STORAGE_KEY, '999');

    const result = readStoredEditorZoom(storage);

    expect(result).toBe(200);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
