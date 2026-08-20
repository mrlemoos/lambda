import { describe, expect, it } from 'vitest';

import {
  ACTUAL_SIZE_ZOOM,
  adjustEditorZoom,
  clampEditorZoom,
  formatZoomReadout,
  MAX_EDITOR_ZOOM,
  MIN_EDITOR_ZOOM,
} from './editorZoom.js';

describe('adjustEditorZoom', () => {
  it('increases zoom in 10% steps', () => {
    const result = adjustEditorZoom(100, 'in');

    expect(result).toBe(110);
  });

  it('decreases zoom in 10% steps', () => {
    const result = adjustEditorZoom(100, 'out');

    expect(result).toBe(90);
  });

  it('resets to actual size', () => {
    const result = adjustEditorZoom(150, 'actual-size');

    expect(result).toBe(ACTUAL_SIZE_ZOOM);
  });

  it('clamps zoom in at the maximum', () => {
    const result = adjustEditorZoom(MAX_EDITOR_ZOOM, 'in');

    expect(result).toBe(MAX_EDITOR_ZOOM);
  });

  it('clamps zoom out at the minimum', () => {
    const result = adjustEditorZoom(MIN_EDITOR_ZOOM, 'out');

    expect(result).toBe(MIN_EDITOR_ZOOM);
  });
});

describe('clampEditorZoom', () => {
  it('clamps values below the minimum', () => {
    const result = clampEditorZoom(25);

    expect(result).toBe(MIN_EDITOR_ZOOM);
  });

  it('clamps values above the maximum', () => {
    const result = clampEditorZoom(250);

    expect(result).toBe(MAX_EDITOR_ZOOM);
  });
});

describe('formatZoomReadout', () => {
  it('formats the zoom level as a percentage label', () => {
    const result = formatZoomReadout(125);

    expect(result).toBe('125%');
  });
});
