import { describe, expect, it } from 'vitest';

import { composeWritingAccess } from './composeWritingAccess.js';

describe('composeWritingAccess', () => {
  it('allows writing during Lambda Web e2e even without a session', () => {
    const input = {
      hasSession: false,
      isOnline: true,
      hasEverSignedInOnThisClient: false,
      isE2e: true,
    };

    const result = composeWritingAccess(input);

    expect(result).toBe('write');
  });

  it('keeps the sign-in wall when e2e is off and there is no session online', () => {
    const input = {
      hasSession: false,
      isOnline: true,
      hasEverSignedInOnThisClient: false,
      isE2e: false,
    };

    const result = composeWritingAccess(input);

    expect(result).toBe('sign-in-wall');
  });
});
