import { describe, expect, it } from 'vitest';

import { getEditorRuntimeMarker, isDevRuntime } from './useScriptEditor.js';

describe('isDevRuntime', () => {
  it('is false when Vite import.meta.env is missing', () => {
    const result = isDevRuntime(undefined);

    expect(result).toBe(false);
  });

  it('is true when Vite DEV is set', () => {
    const result = isDevRuntime({ DEV: true });

    expect(result).toBe(true);
  });
});

describe('getEditorRuntimeMarker', () => {
  it('names the classify runtime', () => {
    const result = getEditorRuntimeMarker();

    expect(result).toBe('lambda-editor-classify-v3');
  });
});
