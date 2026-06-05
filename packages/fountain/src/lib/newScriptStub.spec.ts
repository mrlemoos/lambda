import { describe, expect, it } from 'vitest';

import { parseFountain, stringifyFountain } from './fountain.js';
import { newScriptStub } from './newScriptStub.js';

describe('newScriptStub', () => {
  it('round-trips through parse and stringify', () => {
    const source = newScriptStub();

    expect(stringifyFountain(parseFountain(source))).toBe(source);
  });

  it('produces an editable document with a placeholder action block', () => {
    const { document } = parseFountain(newScriptStub());

    expect(document.content).toEqual([{ type: 'action' }]);
  });
});
