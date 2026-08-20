import { describe, expect, it } from 'vitest';

import { formatWindowTitle } from './formatWindowTitle.js';

describe('formatWindowTitle', () => {
  it('shows Untitled for a new script', () => {
    expect(formatWindowTitle({ fileName: null, isDirty: false })).toBe(
      'Untitled — Lambda',
    );
  });

  it('marks an edited script in the title', () => {
    expect(
      formatWindowTitle({ fileName: 'MyScript.fountain', isDirty: true }),
    ).toBe('MyScript.fountain • Edited — Lambda');
  });
});
