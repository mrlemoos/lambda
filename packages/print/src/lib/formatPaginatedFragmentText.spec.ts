import { describe, expect, it } from 'vitest';

import {
  expandPreviewFragmentLines,
  formatPaginatedFragmentText,
} from './formatPaginatedFragmentText';

describe('formatPaginatedFragmentText', () => {
  it('inserts hard line breaks at pagination wrap boundaries for dialogue', () => {
    const text =
      'when the boss finds out you let him die? You are not gonna shoot me.';

    const result = formatPaginatedFragmentText(
      text,
      'dialogue',
      'us-letter',
      'courier-prime',
    );

    expect(result).toContain('\n');
    expect(result.split('\n')[0]).toBe('when the boss finds out');
    expect(result.startsWith('when the boss finds out\n')).toBe(true);
    expect(result.endsWith('shoot me.')).toBe(true);
  });

  it('leaves character names on one line', () => {
    const result = formatPaginatedFragmentText(
      "GUILLERMO (CONT'D)",
      'character',
      'us-letter',
      'courier-prime',
    );

    expect(result).toBe("GUILLERMO (CONT'D)");
  });
});

describe('expandPreviewFragmentLines', () => {
  it('returns one rendered row per pagination line', () => {
    const text =
      'when the boss finds out you let him die? You are not gonna shoot me.';

    const lines = expandPreviewFragmentLines(
      { elementType: 'dialogue', text },
      'us-letter',
      'courier-prime',
    );

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.map((line) => line.text).join(' ')).toContain(
      'when the boss finds out',
    );
  });

  it('caps wrapped rows to the pagination line budget when provided', () => {
    const text =
      'People who pick this line of work got one option down the road: retirement.';

    const uncapped = expandPreviewFragmentLines(
      { elementType: 'dialogue', text },
      'us-letter',
      'courier-prime',
    );
    const capped = expandPreviewFragmentLines(
      { elementType: 'dialogue', text, paginationLineCount: 1 },
      'us-letter',
      'courier-prime',
    );

    expect(uncapped.length).toBeGreaterThan(1);
    expect(capped).toHaveLength(1);
    expect(capped[0]?.text).toBe('People who pick this line');
  });
});
