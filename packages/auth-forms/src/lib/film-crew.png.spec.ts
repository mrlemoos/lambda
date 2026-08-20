import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('film-crew.png', () => {
  it('is an opaque image with a generated background, not a cutout', () => {
    const png = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'film-crew.png'),
    );

    const result = png[25];

    // PNG colour type 2 = RGB, no alpha channel
    expect(result).toBe(2);
  });
});
