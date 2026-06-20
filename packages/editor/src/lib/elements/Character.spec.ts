import { describe, expect, it } from 'vitest';

import { isCharacter } from './Character';

describe('isCharacter', () => {
  it.each(['STEEL', 'BRICK (O.S.)'])(
    'returns true for uppercase character cues',
    (line) => {
      const input = line;

      const result = isCharacter(input);

      expect(result).toBe(true);
    },
  );

  it('returns true for forced character lines with @', () => {
    const input = '@McCLANE';

    const result = isCharacter(input);

    expect(result).toBe(true);
  });

  it.each(['Steel', 'brick'])(
    'returns false for mixed-case or lowercase names',
    (line) => {
      const input = line;

      const result = isCharacter(input);

      expect(result).toBe(false);
    },
  );

  it.each([
    '!SCANNING THE AISLES…',
    'They drink long and well from the beers.',
    '> FADE TO BLACK.',
    'FADE OUT.',
  ])('returns false for forced action and non-character lines', (line) => {
    const input = line;

    const result = isCharacter(input);

    expect(result).toBe(false);
  });
});
