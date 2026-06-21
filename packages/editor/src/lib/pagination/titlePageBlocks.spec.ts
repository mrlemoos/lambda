import { describe, expect, it } from 'vitest';

import { titlePageBlocks } from './titlePageBlocks';

describe('titlePageBlocks', () => {
  it('returns no blocks for an empty title page', () => {
    const result = titlePageBlocks([]);

    expect(result).toEqual([]);
  });

  it('returns one title page block preserving raw fountain lines', () => {
    const lines = ['Title: BRICK & STEEL', 'Author: Jane Doe'];

    const result = titlePageBlocks(lines);

    expect(result).toEqual([
      { type: 'titlePage', text: 'Title: BRICK & STEEL\nAuthor: Jane Doe' },
    ]);
  });
});
