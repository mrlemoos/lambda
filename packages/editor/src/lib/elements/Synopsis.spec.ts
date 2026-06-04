import { describe, expect, it } from 'vitest';

import { isSynopsis } from './Synopsis';

describe('isSynopsis', () => {
  it.each([
    '= Set up the characters and the story.',
    '=This scene sets up Brick & Steel.',
  ])('returns true for lines starting with =', (line) => {
    const input = line;

    const result = isSynopsis(input);

    expect(result).toBe(true);
  });

  it.each(['=', '# Act I', 'INT. KITCHEN - DAY'])(
    'returns false for non-synopsis lines',
    (line) => {
      const input = line;

      const result = isSynopsis(input);

      expect(result).toBe(false);
    },
  );
});
