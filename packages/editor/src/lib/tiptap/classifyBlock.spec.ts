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

  it('treats prose after a blank line as action even when earlier text is uppercase', () => {
    const result = classifyBlock('This ad shines on a billboard.');

    expect(result).toBe('action');
  });

  it('treats uppercase lines continuing action paragraphs as action', () => {
    const result = classifyBlock('A DIGITAL AD', {
      previousLine: 'The monitor flashes.',
      previousNodeType: 'action',
    });

    expect(result).toBe('action');
  });

  it('treats prose after uppercase action as action', () => {
    const result = classifyBlock('This ad shines on a billboard.', {
      previousLine: 'A DIGITAL AD',
      previousNodeType: 'action',
    });

    expect(result).toBe('action');
  });

  it('keeps explicitly forced characters after action paragraphs', () => {
    const result = classifyBlock('@McCLANE', {
      previousLine: 'The monitor flashes.',
      previousNodeType: 'action',
    });

    expect(result).toBe('character');
  });
});
