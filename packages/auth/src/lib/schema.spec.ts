import { describe, expect, it } from 'vitest';

import { account, session, user, verification } from './schema.js';

describe('account identity schema', () => {
  it('defines Neon tables for users and sessions', () => {
    const result = [user, session, account, verification];

    expect(result).toHaveLength(4);
    expect(user.email).toBeDefined();
    expect(session.token).toBeDefined();
  });
});
