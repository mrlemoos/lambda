import { describe, expect, it } from 'vitest';

import { parseFountain, stringifyFountain } from './fountain.js';

function nodeText(node: { content?: { text?: string }[] }): string {
  return node.content?.map((child) => child.text ?? '').join('') ?? '';
}

function visibleTypes(document: ReturnType<typeof parseFountain>['document']) {
  return (document.content ?? [])
    .filter((node) => nodeText(node).trim().length > 0)
    .map((node) => node.type);
}

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

    expect(visibleTypes(document)).toEqual([
      'sceneHeading',
      'action',
      'character',
      'dialogue',
    ]);
    expect(
      document.content?.map((node) => [node.type, nodeText(node)]),
    ).toEqual([
      ['sceneHeading', 'INT. HOUSE - DAY'],
      ['action', 'Some action line goes here...'],
      ['action', ''],
      ['character', 'CHARACTER NAME'],
      ['dialogue', 'This is a line of dialogue.'],
    ]);
  });

  it('parses uppercase lines inside action paragraphs as action', () => {
    const source = `The monitor flashes.
A DIGITAL AD
This ad shines on a billboard.
`;

    const { document } = parseFountain(source);

    expect(visibleTypes(document)).toEqual(['action', 'action', 'action']);
    expect(stringifyFountain(parseFountain(source))).toBe(source);
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

    expect(visibleTypes(document)).toEqual(['sceneHeading', 'action']);
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

    expect(visibleTypes(document)).toEqual(['action', 'action']);
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

  it('omits slugline document settings from the editor document', () => {
    const source = `INT. KITCHEN - DAY

Action.

{{Slugline Document Settings
Page Format: A4
}}
`;

    const script = parseFountain(source);

    expect(script.sluglineSettings).toEqual(['Page Format: A4']);
    expect(script.pageFormat).toBe('a4');
    expect(visibleTypes(script.document)).toEqual(['sceneHeading', 'action']);
    expect(stringifyFountain(script)).toBe(source);
  });
});
