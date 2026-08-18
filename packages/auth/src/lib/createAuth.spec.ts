import { describe, expect, it } from 'vitest';

import { createAuth } from './createAuth.js';

describe('createAuth', () => {
  it('builds a better-auth instance when a Neon URL is provided', () => {
    const result = createAuth({
      DATABASE_URL: 'postgres://lambda',
      BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret',
      BETTER_AUTH_URL: 'http://localhost:4300',
    });

    expect(result.handler).toEqual(expect.any(Function));
    expect(result.api).toBeDefined();
  });
});
