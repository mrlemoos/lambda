import { describe, expect, it } from 'vitest';

import { formatLibraryEntryLabel } from './formatLibraryEntryLabel.js';

describe('formatLibraryEntryLabel', () => {
  it('shows a relative timestamp beside the display name', () => {
    const referenceMs = Date.parse('2026-06-20T12:00:00.000Z');
    const updatedAtMs = referenceMs - 2 * 60 * 60 * 1000;

    const result = formatLibraryEntryLabel('JULIE', updatedAtMs, referenceMs);

    expect(result).toBe('JULIE · 2 hours ago');
  });
});
