import { describe, expect, it } from 'vitest';

import { isTitlePage } from './TitlePage';

describe('isTitlePage', () => {
  it.each([
    'Title: BRICK & STEEL',
    'Author: Stu Maschwitz',
    'Draft date: 1/20/2012',
    'Credit:',
  ])('returns true for title page keys', (line) => {
    const input = line;

    const result = isTitlePage(input);

    expect(result).toBe(true);
  });

  it.each([
    ['    Time Chef 2', 'Title:'],
    ['       Fricassee You Later', 'Title:'],
    ['    Fricassee You Later', '    Time Chef 2'],
  ])('returns true for indented title page values', (line, previousLine) => {
    const input = line;
    const previous = previousLine;

    const result = isTitlePage(input, previous);

    expect(result).toBe(true);
  });

  it.each([
    'CUT TO:',
    'INT. KITCHEN - DAY',
    'They drink long and well from the beers.',
  ])('returns false for screenplay body lines', (line) => {
    const input = line;

    const result = isTitlePage(input);

    expect(result).toBe(false);
  });
});
