import { describe, expect, it } from 'vitest';

import { isSection } from './Section';

describe('isSection', () => {
  it.each(['# Act I', '## Sequence', '### Scene'])(
    'returns true for Fountain section markers',
    (line) => {
      const input = line;

      const result = isSection(input);

      expect(result).toBe(true);
    },
  );

  it.each([
    'INT. KITCHEN - DAY',
    '= Synopsis beat',
    'They drink long and well from the beers.',
  ])('returns false for non-section lines', (line) => {
    const input = line;

    const result = isSection(input);

    expect(result).toBe(false);
  });
});
