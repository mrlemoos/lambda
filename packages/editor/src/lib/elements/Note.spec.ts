import { describe, expect, it } from 'vitest';

import { isNote } from './Note';

describe('isNote', () => {
  it.each([
    '[[Todo: fix this scene]]',
    '[[Was supposed to be Vietnamese, right?]]',
  ])('returns true for Fountain notes in double brackets', (line) => {
    const input = line;

    const result = isNote(input);

    expect(result).toBe(true);
  });

  it.each(['(pause)', '[[unfinished note', 'STEEL'])(
    'returns false for non-note lines',
    (line) => {
      const input = line;

      const result = isNote(input);

      expect(result).toBe(false);
    },
  );
});
