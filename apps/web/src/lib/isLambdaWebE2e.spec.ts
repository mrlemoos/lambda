import { describe, expect, it } from 'vitest';

import { isLambdaWebE2e } from './isLambdaWebE2e.js';

describe('isLambdaWebE2e', () => {
  it('is false when e2e env vars are unset', () => {
    const env = {};

    const result = isLambdaWebE2e(env);

    expect(result).toBe(false);
  });

  it('is true when NEXT_PUBLIC_E2E is 1', () => {
    const env = { NEXT_PUBLIC_E2E: '1' };

    const result = isLambdaWebE2e(env);

    expect(result).toBe(true);
  });

  it('is true when VITE_E2E is 1', () => {
    const env = { VITE_E2E: '1' };

    const result = isLambdaWebE2e(env);

    expect(result).toBe(true);
  });
});
