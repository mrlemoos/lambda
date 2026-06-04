import { describe, expect, it } from 'vitest';

import { isParenthetical } from './Parenthetical';

describe('isParenthetical', () => {
  it.each(['(starting the engine)', '(pause)', '  (oh crap)  '])(
    'returns true for lines wrapped in parentheses',
    (line) => {
      const input = line;

      const result = isParenthetical(input);

      expect(result).toBe(true);
    },
  );

  it.each(['(pause) in the middle', 'STEEL'])(
    'returns false when parentheses do not wrap the whole line',
    (line) => {
      const input = line;

      const result = isParenthetical(input);

      expect(result).toBe(false);
    },
  );

  it.each(['CUT TO:', 'They drink long and well from the beers.'])(
    'returns false for other element lines',
    (line) => {
      const input = line;

      const result = isParenthetical(input);

      expect(result).toBe(false);
    },
  );
});
