import { describe, expect, it } from 'vitest';

import { createLambdaAuthClient } from './createLambdaAuthClient.js';

describe('createLambdaAuthClient', () => {
  it('returns a better-auth React client', () => {
    const result = createLambdaAuthClient();

    expect(result.signIn).toBeDefined();
    expect(result.signUp).toBeDefined();
    expect(result.signOut).toBeDefined();
  });
});
