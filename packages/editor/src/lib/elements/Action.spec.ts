import { describe, expect, it } from 'vitest';

import { isAction } from './Action';

describe('isAction', () => {
  it.each([
    'They drink long and well from the beers.',
    '!SCANNING THE AISLES…',
  ])('returns true for narrative action lines', (line) => {
    const input = line;

    const result = isAction(input);

    expect(result).toBe(true);
  });

  it.each([
    'INT. KITCHEN - DAY',
    'CUT TO:',
    'STEEL',
    '(pause)',
    '# Act I',
    '= Setup beat',
    '[[Todo]]',
    'Title: BRICK & STEEL',
  ])('returns false for other screenplay elements', (line) => {
    const input = line;

    const result = isAction(input);

    expect(result).toBe(false);
  });

  it('returns false for dialogue when the previous line qualifies', () => {
    const line = 'Luke. Search your feelings.';
    const previousLine = 'DARTH VADER';

    const result = isAction(line, previousLine);

    expect(result).toBe(false);
  });

  it.each(['', '   '])('returns false for empty lines', (line) => {
    const input = line;

    const result = isAction(input);

    expect(result).toBe(false);
  });
});
