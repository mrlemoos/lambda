import { describe, expect, it } from 'vitest';

import { classifyBlock } from './classifyBlock';

describe('classifyBlock', () => {
  it('treats prose after a character node as dialogue', () => {
    const result = classifyBlock('This is a line of dialogue.', {
      previousLine: 'CHARACTER NAME',
      previousNodeType: 'character',
    });

    expect(result).toBe('dialogue');
  });

  it('treats prose after a parenthetical node as dialogue', () => {
    const result = classifyBlock('Hello?', {
      previousLine: '(quietly)',
      previousNodeType: 'parenthetical',
    });

    expect(result).toBe('dialogue');
  });

  it('treats prose after a dialogue line as action', () => {
    const result = classifyBlock('He walks away.', {
      previousLine: 'This is a line of dialogue.',
      previousNodeType: 'dialogue',
    });

    expect(result).toBe('action');
  });
});
