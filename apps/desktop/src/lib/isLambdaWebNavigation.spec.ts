import { describe, expect, it } from 'vitest';

import { isLambdaWebNavigation } from './isLambdaWebNavigation.js';

describe('isLambdaWebNavigation', () => {
  it('allows a path on the same origin', () => {
    const target = 'http://localhost:4300/script';
    const allowedOrigin = 'http://localhost:4300';

    const result = isLambdaWebNavigation(target, allowedOrigin);

    expect(result).toBe(true);
  });

  it('rejects a different origin', () => {
    const target = 'https://evil.example/';
    const allowedOrigin = 'http://localhost:4300';

    const result = isLambdaWebNavigation(target, allowedOrigin);

    expect(result).toBe(false);
  });
});
