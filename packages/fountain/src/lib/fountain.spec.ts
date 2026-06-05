import { describe, expect, it } from 'vitest';

import { parseFountain, stringifyFountain } from './fountain.js';

describe('parseFountain / stringifyFountain', () => {
  it('round-trips a scene heading', () => {
    const source = 'INT. KITCHEN - DAY\n';

    const document = parseFountain(source);

    expect(stringifyFountain(document)).toBe(source);
  });

  it('round-trips an action line', () => {
    const source = 'They drink long and well from the beers.\n';

    const document = parseFountain(source);

    expect(stringifyFountain(document)).toBe(source);
  });

  it('round-trips a new-script title page stub', () => {
    const source = `Title:

Credit: Written by
Author:

`;

    const document = parseFountain(source);

    expect(stringifyFountain(document)).toBe(source);
  });

  it('round-trips dialogue blocks', () => {
    const source = `INT. HOUSE - DAY

STEEL
Hello?
`;

    const document = parseFountain(source);

    expect(stringifyFountain(document)).toBe(source);
  });

  it('parses prose after a character cue as dialogue nodes', () => {
    const source = `INT. HOUSE - DAY
Some action line goes here...
CHARACTER NAME
This is a line of dialogue.
`;

    const { document } = parseFountain(source);
    const types = (document.content ?? []).map((node) => node.type);

    expect(types).toEqual(['sceneHeading', 'action', 'character', 'dialogue']);
  });

  it('round-trips title page and body', () => {
    const source = `Title: BRICK & STEEL
Credit: Written by
Author: Jane Doe

INT. KITCHEN - DAY
They enter.
`;

    const document = parseFountain(source);

    expect(stringifyFountain(document)).toBe(source);
  });

  it('parses title pages with unindented title text before other keys', () => {
    const source = `Title:
MY SCRIPT
Credit: by
Author: Jane Doe

INT. KITCHEN - DAY
They enter.
`;

    expect(() => parseFountain(source)).not.toThrow();
    expect(parseFountain(source).titlePage).toEqual([
      'Title:',
      'MY SCRIPT',
      'Credit: by',
      'Author: Jane Doe',
    ]);
  });
});
