import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('drizzle config', () => {
  it('points identity schema at Postgres for Neon', () => {
    const result = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../drizzle.config.ts'),
      'utf8',
    );

    expect(result).toContain("dialect: 'postgresql'");
    expect(result).toContain("schema: './src/lib/schema.ts'");
  });
});
