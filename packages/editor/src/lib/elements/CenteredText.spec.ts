import { describe, expect, it } from 'vitest';

import {
  centeredTextPrintText,
  getCenteredTextSuffixLength,
  isCenteredText,
} from './CenteredText';

describe('isCenteredText', () => {
  it('returns true for Fountain centred text brackets', () => {
    const input = '> THE END <';

    const result = isCenteredText(input);

    expect(result).toBe(true);
  });
});

describe('getCenteredTextSuffixLength', () => {
  it('returns 1 for the closing bracket on centred text', () => {
    const input = '> THE END <';

    const result = getCenteredTextSuffixLength(input);

    expect(result).toBe(1);
  });

  it.each(['CUT TO:', '> FADE TO BLACK.', 'THE END'])(
    'returns 0 for non-centred lines: %s',
    (line) => {
      const result = getCenteredTextSuffixLength(line);

      expect(result).toBe(0);
    },
  );
});

describe('centeredTextPrintText', () => {
  it('omits Fountain bracket markers for pagination and print', () => {
    const input = '> THE END <';

    const result = centeredTextPrintText(input);

    expect(result).toBe('THE END');
  });

  it('returns the original text when the line is not centred', () => {
    const input = '> FADE TO BLACK.';

    const result = centeredTextPrintText(input);

    expect(result).toBe('> FADE TO BLACK.');
  });
});
