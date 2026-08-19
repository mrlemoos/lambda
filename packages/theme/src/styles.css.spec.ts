import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('theme styles source', () => {
  it('scans workspace packages and Lambda Web for Tailwind classes', () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'styles.css'),
      'utf8',
    );

    const result = css;

    expect(result).toContain("@source '../../**/*.{ts,tsx}'");
    expect(result).toContain("@source '../../../apps/web/src/**/*.{ts,tsx}'");
  });
});
