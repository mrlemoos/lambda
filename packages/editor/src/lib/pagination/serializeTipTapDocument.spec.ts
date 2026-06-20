import { describe, expect, it } from 'vitest';

import { serializeTipTapDocument } from './serializeTipTapDocument';

describe('serializeTipTapDocument', () => {
  it('omits centred text bracket markers from pagination text', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'centeredText',
          content: [{ type: 'text', text: '> THE END <' }],
        },
      ],
    };

    const result = serializeTipTapDocument(document);

    expect(result).toEqual([{ type: 'centeredText', text: 'THE END' }]);
  });
});
