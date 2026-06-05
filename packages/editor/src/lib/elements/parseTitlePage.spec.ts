import { describe, expect, it } from 'vitest';

import { parseTitlePage } from './parseTitlePage';

describe('parseTitlePage', () => {
  it('parses inline title page keys without labels in output fields', () => {
    const lines = [
      'Title: BRICK & STEEL',
      'Author: Stu Maschwitz',
      'Draft date: 1/20/2012',
    ];

    const result = parseTitlePage(lines);

    expect(result.title).toEqual(['BRICK & STEEL']);
    expect(result.author).toEqual(['Stu Maschwitz']);
    expect(result.draftDate).toBe('1/20/2012');
  });

  it('parses multiline title and contact blocks', () => {
    const lines = [
      'Title:',
      '    Time Chef 2',
      '    Fricassee You Later',
      'Credit: Written by',
      'Author: Stu Maschwitz',
      'Contact:',
      '    Next Level Productions',
      '    Solvang, CA 93463',
    ];

    const result = parseTitlePage(lines);

    expect(result.title).toEqual(['Time Chef 2', 'Fricassee You Later']);
    expect(result.credit).toBe('Written by');
    expect(result.contact).toEqual([
      'Next Level Productions',
      'Solvang, CA 93463',
    ]);
  });

  it('strips fountain emphasis markers from values', () => {
    const lines = ['Title: _**BRICK & STEEL**_'];

    const result = parseTitlePage(lines);

    expect(result.title).toEqual(['BRICK & STEEL']);
  });

  it('stops at the first screenplay line', () => {
    const lines = ['Title: BRICK & STEEL', '', 'INT. KITCHEN - DAY'];

    const result = parseTitlePage(lines);

    expect(result.title).toEqual(['BRICK & STEEL']);
  });

  it('includes blank lines between title page keys', () => {
    const lines = ['Title:', '', 'Credit: Written by', 'Author:', ''];

    expect(parseTitlePage(lines).credit).toBe('Written by');
  });

  it('parses unindented title text after a key-only Title line', () => {
    const lines = ['Title:', 'MY SCRIPT', 'Credit: by', 'Author: Jane Doe'];

    const result = parseTitlePage(lines);

    expect(result.title).toEqual(['MY SCRIPT']);
    expect(result.credit).toBe('by');
    expect(result.author).toEqual(['Jane Doe']);
  });
});
