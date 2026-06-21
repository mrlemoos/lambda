import { describe, expect, it } from 'vitest';

import { parseTitlePage } from './parseTitlePage';
import { stringifyTitlePage } from './stringifyTitlePage';

describe('stringifyTitlePage', () => {
  it('writes inline title page keys', () => {
    const data = {
      title: ['BRICK & STEEL'],
      author: ['Stu Maschwitz'],
      draftDate: '1/20/2012',
    };

    const lines = stringifyTitlePage(data);

    expect(lines).toEqual([
      'Title: BRICK & STEEL',
      'Author: Stu Maschwitz',
      'Draft date: 1/20/2012',
    ]);
  });

  it('writes multiline title and contact blocks with indentation', () => {
    const data = {
      title: ['Time Chef 2', 'Fricassee You Later'],
      credit: 'Written by',
      author: ['Stu Maschwitz'],
      contact: ['Next Level Productions', 'Solvang, CA 93463'],
    };

    const lines = stringifyTitlePage(data);

    expect(lines).toEqual([
      'Title:',
      '    Time Chef 2',
      '    Fricassee You Later',
      'Credit: Written by',
      'Author: Stu Maschwitz',
      'Contact:',
      '    Next Level Productions',
      '    Solvang, CA 93463',
    ]);
  });

  it('round-trips through parseTitlePage', () => {
    const source = [
      'Title: BRICK & STEEL',
      'Credit: Written by',
      'Author: Jane Doe',
      'Draft date: 1/20/2012',
      'Copyright: © 2026',
    ];

    const parsed = parseTitlePage(source);
    const output = stringifyTitlePage(parsed);

    expect(parseTitlePage(output)).toEqual(parsed);
  });

  it('writes a new-script title page stub', () => {
    const lines = stringifyTitlePage({
      title: [],
      credit: 'Written by',
      author: [],
    });

    expect(lines).toEqual(['Title:', 'Credit: Written by', 'Author:']);
  });
});
