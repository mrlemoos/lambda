import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('liquid-metal chrome', () => {
  it('spins a conic rim instead of a static border gradient', () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'app-ui.css'),
      'utf8',
    );

    const result = css;

    expect(result).toContain('@property --lm-angle');
    expect(result).toContain('from var(--lm-angle)');
    expect(result).toContain('padding-box');
    expect(result).toContain('border-box');
    expect(result).toMatch(/\.lm-button[\s\S]*animation:\s*lm-spin/);
  });

  it('shows the spinning metal rim on fields only while focused', () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'app-ui.css'),
      'utf8',
    );

    const result = css;

    expect(result).toMatch(
      /\.lm-field:focus-within[\s\S]{0,500}animation:\s*lm-spin/,
    );
    expect(result).toMatch(
      /\.lm-field:focus-within[\s\S]{0,500}conic-gradient/,
    );
    expect(result.match(/\.lm-field \{[^}]+\}/)?.[0] ?? '').not.toContain(
      'animation:',
    );
  });
});
