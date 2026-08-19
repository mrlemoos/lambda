import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getTableName } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { account, session, user, verification } from './schema.js';

describe('identity SQL', () => {
  it('creates better-auth user, session, account, and verification tables', () => {
    const result = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../drizzle/0000_identity.sql',
      ),
      'utf8',
    );

    for (const table of [user, session, account, verification]) {
      expect(result).toContain(`CREATE TABLE "${getTableName(table)}"`);
    }

    expect(result).toContain('email_verified');
    expect(result).toContain('REFERENCES "public"."user"("id")');
  });
});
