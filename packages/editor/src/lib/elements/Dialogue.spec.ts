import { describe, expect, it } from 'vitest';

import { isDialogue } from './Dialogue';

describe('isDialogue', () => {
  it.each([
    ['Luke. Search your feelings.', 'DARTH VADER'],
    ['Ten.', 'DEALER'],
  ])(
    'returns true when the previous line is a character cue',
    (line, previousLine) => {
      const input = line;
      const previous = previousLine;

      const result = isDialogue(input, previous);

      expect(result).toBe(true);
    },
  );

  it('returns true when the previous line is a parenthetical', () => {
    const line = 'Hit or stand sir?';
    const previousLine = '(pause)';

    const result = isDialogue(line, previousLine);

    expect(result).toBe(true);
  });

  it.each([
    ['Luke. Search your feelings.', undefined],
    ['Luke. Search your feelings.', 'INT. KITCHEN - DAY'],
    ['Luke. Search your feelings.', 'CUT TO:'],
  ])(
    'returns false without a qualifying previous line',
    (line, previousLine) => {
      const input = line;
      const previous = previousLine;

      const result = isDialogue(input, previous);

      expect(result).toBe(false);
    },
  );

  it('returns false for empty dialogue', () => {
    const line = '';
    const previousLine = 'STEEL';

    const result = isDialogue(line, previousLine);

    expect(result).toBe(false);
  });
});
