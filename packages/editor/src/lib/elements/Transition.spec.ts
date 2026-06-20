import { describe, expect, it } from 'vitest';

import { isTransition } from './Transition';

describe('isTransition', () => {
  it.each(['CUT TO:', 'SMASH CUT TO:', 'FADE IN:'])(
    'returns true for all-uppercase lines ending with a colon: %s',
    (line) => {
      const input = line;

      const result = isTransition(input);

      expect(result).toBe(true);
    },
  );

  it.each(['> FADE TO BLACK.', '>CUT TO BLACK.'])(
    'returns true for forced all-uppercase transitions starting with >: %s',
    (line) => {
      const input = line;

      const result = isTransition(input);

      expect(result).toBe(true);
    },
  );

  it.each([
    'cut to:',
    'Cut To:',
    'FADE OUT.',
    'FADE OUT',
    'CUT TO BLACK.',
    '>Burn to White.',
    'Title: BRICK & STEEL',
    'INT. KITCHEN - DAY',
    'STEEL',
    'Credit:',
    'They drink long and well from the beers.',
  ])('returns false for non-transition lines: %s', (line) => {
    const input = line;

    const result = isTransition(input);

    expect(result).toBe(false);
  });
});
