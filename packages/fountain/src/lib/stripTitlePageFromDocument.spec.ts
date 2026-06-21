import { describe, expect, it } from 'vitest';

import { stripTitlePageFromDocument } from './stripTitlePageFromDocument.js';

describe('stripTitlePageFromDocument', () => {
  it('removes leading action blocks that duplicate title page lines', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'action',
          content: [{ type: 'text', text: 'Title:' }],
        },
        {
          type: 'action',
          content: [{ type: 'text', text: 'Credit: Written by' }],
        },
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. KITCHEN - DAY' }],
        },
      ],
    };
    const titlePage = ['Title:', 'Credit: Written by'];

    const result = stripTitlePageFromDocument(document, titlePage);

    expect(result.content?.map((node) => node.type)).toEqual(['sceneHeading']);
  });

  it('keeps the body editable when all leading blocks were title page lines', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'action',
          content: [{ type: 'text', text: 'Title:' }],
        },
      ],
    };
    const titlePage = ['Title:'];

    const result = stripTitlePageFromDocument(document, titlePage);

    expect(result.content).toEqual([{ type: 'action' }]);
  });

  it('does not strip body action lines that only resemble title page keys', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'action',
          content: [{ type: 'text', text: 'Title: HEXA Q4 PARTY' }],
        },
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. PARTY - NIGHT' }],
        },
      ],
    };

    const result = stripTitlePageFromDocument(document, []);

    expect(result.content?.map((node) => node.type)).toEqual([
      'action',
      'sceneHeading',
    ]);
  });
});
