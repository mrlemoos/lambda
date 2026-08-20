import { describe, expect, it } from 'vitest';

import { authLinkClassName } from './authLink.js';

describe('authLinkClassName', () => {
  it('marks the switch link as primary underlined text', () => {
    const result = authLinkClassName.split(/\s+/u);

    expect(result).toEqual(
      expect.arrayContaining([
        'text-primary',
        'underline',
        'underline-offset-2',
      ]),
    );
  });
});
