import { describe, expect, it } from 'vitest';

import { isSceneHeading } from './SceneHeading';

describe('isSceneHeading', () => {
  it.each(['INT. KITCHEN - DAY', 'INT/EXT. APARTMENT - NIGHT'])(
    'returns true for INT scene headings',
    (line) => {
      const input = line;

      const result = isSceneHeading(input);

      expect(result).toBe(true);
    },
  );

  it.each(["ext. brick's pool - day", 'i/e. moving car - day'])(
    'matches scene heading prefixes case-insensitively',
    (line) => {
      const input = line;

      const result = isSceneHeading(input);

      expect(result).toBe(true);
    },
  );

  it.each(['.SNIPER SCOPE POV', '.Back in the warehouse'])(
    'returns true for forced scene headings with a leading period',
    (line) => {
      const input = line;

      const result = isSceneHeading(input);

      expect(result).toBe(true);
    },
  );

  it.each(['Steel enters the room.', 'STEEL', 'CUT TO:'])(
    'returns false for non-scene-heading lines',
    (line) => {
      const input = line;

      const result = isSceneHeading(input);

      expect(result).toBe(false);
    },
  );
});
