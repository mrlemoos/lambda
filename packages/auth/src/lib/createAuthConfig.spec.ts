import { describe, expect, it } from 'vitest';

import {
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
  ACCOUNT_SESSION_UPDATE_AGE_SECONDS,
  createAuthConfig,
  getDatabaseUrl,
} from './createAuthConfig.js';

describe('createAuthConfig', () => {
  it('enables email and password with a 30-day sliding session', () => {
    const result = createAuthConfig();

    expect(result.emailAndPassword.enabled).toBe(true);
    expect(result.session.expiresIn).toBe(ACCOUNT_SESSION_MAX_AGE_SECONDS);
    expect(result.session.updateAge).toBe(ACCOUNT_SESSION_UPDATE_AGE_SECONDS);
    expect(ACCOUNT_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});

describe('getDatabaseUrl', () => {
  it('reads DATABASE_URL from the environment', () => {
    const result = getDatabaseUrl({ DATABASE_URL: 'postgres://lambda' });

    expect(result).toBe('postgres://lambda');
  });

  it('falls back to POSTGRES_URL from the Vercel Marketplace', () => {
    const result = getDatabaseUrl({ POSTGRES_URL: 'postgres://neon' });

    expect(result).toBe('postgres://neon');
  });

  it('throws when no Neon connection string is configured', () => {
    const attempt = () => getDatabaseUrl({});

    expect(attempt).toThrow(/DATABASE_URL is not set/);
  });
});
