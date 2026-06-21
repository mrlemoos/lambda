import { describe, expect, it } from 'vitest';

import { getForcedPrefixLength, fountainPrintText } from './forcedPrefix';

describe('getForcedPrefixLength', () => {
  it.each([
    ['.SNIPER SCOPE POV', 1],
    ['.Back in the warehouse', 1],
  ])('returns 1 for forced scene heading prefix %s', (line, expected) => {
    const result = getForcedPrefixLength(line);

    expect(result).toBe(expected);
  });

  it.each(['Steel enters the room.', 'INT. KITCHEN - DAY', '.'])(
    'returns 0 when the line does not use a forced prefix',
    (line) => {
      const result = getForcedPrefixLength(line);

      expect(result).toBe(0);
    },
  );

  it.each([
    ['@McCLANE', 1],
    ['>Burn to White.', 1],
    ['!SCANNING THE AISLES…', 1],
    ['~Will I tell the world', 1],
  ])('returns 1 for other forced Fountain prefixes on %s', (line, expected) => {
    const result = getForcedPrefixLength(line);

    expect(result).toBe(expected);
  });
});

describe('fountainPrintText', () => {
  it.each([
    ['!OUTSIDE THE WINDSHIELD', 'OUTSIDE THE WINDSHIELD'],
    ['@McCLANE', 'McCLANE'],
    ['>Burn to White.', 'Burn to White.'],
    ['.SNIPER SCOPE POV', 'SNIPER SCOPE POV'],
    ['~Will I tell the world', 'Will I tell the world'],
    ['>FADE IN<', 'FADE IN'],
    ['INT. KITCHEN - DAY', 'INT. KITCHEN - DAY'],
  ])('omits force-syntax markers from %s', (input, expected) => {
    expect(fountainPrintText(input)).toBe(expected);
  });
});
