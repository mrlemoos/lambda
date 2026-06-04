import { describe, expect, it } from 'vitest';

import { isTransition } from './Transition';

describe('isTransition', () => {
  it.each(['CUT TO:', 'SMASH CUT TO:'])(
    'returns true for lines ending with TO:',
    (line) => {
      const input = line;

      const result = isTransition(input);

      expect(result).toBe(true);
    },
  );

  it.each(['> FADE TO BLACK.', '>Burn to White.'])(
    'returns true for forced transitions starting with >',
    (line) => {
      const input = line;

      const result = isTransition(input);

      expect(result).toBe(true);
    },
  );

  it.each(['FADE OUT.', 'FADE OUT', 'CUT TO BLACK.'])(
    'returns true for known transition literals',
    (line) => {
      const input = line;

      const result = isTransition(input);

      expect(result).toBe(true);
    },
  );

  it.each([
    'INT. KITCHEN - DAY',
    'STEEL',
    'Credit:',
    'Title: BRICK & STEEL',
    'They drink long and well from the beers.',
  ])('returns false for other element lines', (line) => {
    const input = line;

    const result = isTransition(input);

    expect(result).toBe(false);
  });
});
