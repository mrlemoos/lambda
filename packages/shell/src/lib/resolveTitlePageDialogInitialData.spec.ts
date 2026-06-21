import { newScriptStub, parseFountain } from '@lambda/fountain';
import { describe, expect, it } from 'vitest';

import { resolveTitlePageDialogInitialData } from './resolveTitlePageDialogInitialData.js';

describe('resolveTitlePageDialogInitialData', () => {
  it('uses fountain title page metadata when present', () => {
    const script = parseFountain(`Title: BRICK & STEEL
Credit: Written by

INT. KITCHEN - DAY
`);

    const result = resolveTitlePageDialogInitialData({
      script,
      savedText: `Title: BRICK & STEEL
Credit: Written by

INT. KITCHEN - DAY
`,
      displayName: 'ignored.fountain',
      filePath: null,
    });

    expect(result.title).toEqual(['BRICK & STEEL']);
    expect(result.credit).toBe('Written by');
  });

  it('keeps stub credit and author keys when seeding the title from the display name', () => {
    const savedText = newScriptStub();
    const script = parseFountain(savedText);

    const result = resolveTitlePageDialogInitialData({
      script,
      savedText,
      displayName: 'Port of Ambitions',
      filePath: null,
    });

    expect(result.title).toEqual(['Port of Ambitions']);
    expect(result.credit).toBe('Written by');
  });

  it('seeds the title from the library display name when fountain has no title page', () => {
    const script = parseFountain(`INT. SUBURBIA - (1990) - NIGHT
MARIO enters.
`);

    const result = resolveTitlePageDialogInitialData({
      script,
      savedText: `INT. SUBURBIA - (1990) - NIGHT
MARIO enters.
`,
      displayName: 'Port of Ambitions',
      filePath: null,
    });

    expect(result.title).toEqual(['Port of Ambitions']);
  });

  it('falls back to the open file name when no display name exists', () => {
    const script = parseFountain(`INT. SUBURBIA - (1990) - NIGHT
`);

    const result = resolveTitlePageDialogInitialData({
      script,
      savedText: `INT. SUBURBIA - (1990) - NIGHT
`,
      displayName: null,
      filePath: '/scripts/Port of Ambitions.fountain',
    });

    expect(result.title).toEqual(['Port of Ambitions']);
  });

  it('merges title page metadata from saved text when the live script model is stale', () => {
    const savedText = `
Title: Port of Ambitions
Credit: Written by
Author: Jane Doe

INT. SUBURBIA - (1990) - NIGHT
`;
    const script = parseFountain(`INT. SUBURBIA - (1990) - NIGHT
`);

    const result = resolveTitlePageDialogInitialData({
      script,
      savedText,
      displayName: 'Port of Ambitions',
      filePath: null,
    });

    expect(result.title).toEqual(['Port of Ambitions']);
    expect(result.credit).toBe('Written by');
    expect(result.author).toEqual(['Jane Doe']);
  });
});
