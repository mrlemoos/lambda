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

  it('round-trips title-page-looking prose in the script body as action', () => {
    const source = `Title: HEXA Q4 PARTY

INT. PARTY - NIGHT
Credit: Large letters plunge from above: HEXA Q4 PARTY.
`;

    const { document } = parseFountain(source);

    expect(document.content?.map((node) => node.type)).toEqual([
      'sceneHeading',
      'action',
    ]);
    expect(stringifyFountain(parseFountain(source))).toBe(source);
  });

  it('does not extract a title page from title-page-looking prose after body content', () => {
    const source = `INT. PARTY - NIGHT
Credit: Large letters plunge from above: HEXA Q4 PARTY.
`;

    expect(stringifyFountain(parseFountain(source))).toBe(source);
  });

  it('parses blank-line-separated uppercase prose as action', () => {
    const source = `A DIGITAL AD

This ad shines on a billboard.
`;

    const { document } = parseFountain(source);

    expect(document.content?.map((node) => node.type)).toEqual([
      'action',
      'action',
    ]);
  });

  it('round-trips centred text as its own element', () => {
    const source = `> THE END <
`;

    const { document } = parseFountain(source);

    expect(document.content?.map((node) => node.type)).toEqual([
      'centeredText',
    ]);
    expect(stringifyFountain(parseFountain(source))).toBe(source);
  });

  it('parses Fountain emphasis markers into marks across script elements', () => {
    const source = `INT. **KITCHEN** - DAY
_*They*_ enter.
= _**Setup**_ beat
`;

    const { document } = parseFountain(source);

    expect(document.content).toEqual([
      {
        type: 'sceneHeading',
        content: [
          { type: 'text', text: 'INT. ' },
          { type: 'text', text: 'KITCHEN', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' - DAY' },
        ],
      },
      {
        type: 'action',
        content: [
          {
            type: 'text',
            text: 'They',
            marks: [{ type: 'underline' }, { type: 'italic' }],
          },
          { type: 'text', text: ' enter.' },
        ],
      },
      {
        type: 'synopsis',
        content: [
          { type: 'text', text: '= ' },
          {
            type: 'text',
            text: 'Setup',
            marks: [{ type: 'underline' }, { type: 'bold' }],
          },
          { type: 'text', text: ' beat' },
        ],
      },
    ]);
    expect(stringifyFountain(parseFountain(source))).toBe(source);
  });
});
