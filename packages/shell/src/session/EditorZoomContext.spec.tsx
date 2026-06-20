import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import {
  EditorZoomProvider,
  useEditorZoom,
} from '../session/EditorZoomContext.js';
import { EDITOR_ZOOM_STORAGE_KEY } from '../lib/editorZoomStorage.js';
import type { LambdaApi } from '../lib/api.js';
import { LambdaApiProvider } from '../session/LambdaApiContext.js';

describe('EditorZoomProvider', () => {
  it('adjusts and persists editor zoom', () => {
    const storage = createMemoryStorage();
    const api = createTestApi();

    const { result } = renderHook(() => useEditorZoom(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/script']}>
          <LambdaApiProvider api={api}>
            <EditorZoomProvider storage={storage}>
              {children}
            </EditorZoomProvider>
          </LambdaApiProvider>
        </MemoryRouter>
      ),
    });

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.level).toBe(110);
    expect(result.current.readout).toBe('110%');
    expect(storage.getItem(EDITOR_ZOOM_STORAGE_KEY)).toBe('110');
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

function createTestApi(): LambdaApi {
  return {
    platform: 'web',
    onFileCommand: () => () => undefined,
    onViewCommand: () => () => undefined,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    setWindowTitle: vi.fn(),
  };
}
