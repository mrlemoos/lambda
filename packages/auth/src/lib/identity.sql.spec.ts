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

  it('backfills the issuer before requiring it', () => {
    const result = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../drizzle/0001_add_account_issuer.sql',
      ),
      'utf8',
    );

    expect(result).toContain('ADD COLUMN "issuer" text');
    expect(result).toContain(
      'UPDATE "account" SET "issuer" = \'local:credential\'',
    );
    expect(result).toContain('ALTER COLUMN "issuer" SET NOT NULL');
  });
});
