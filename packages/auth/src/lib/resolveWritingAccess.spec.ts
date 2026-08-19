import { describe, expect, it } from 'vitest';

import { resolveWritingAccess } from './resolveWritingAccess.js';

describe('resolveWritingAccess', () => {
  it('sends an online client without a session to the sign-in wall', () => {
    const input = {
      hasSession: false,
      isOnline: true,
      hasEverSignedInOnThisClient: false,
    };

    const result = resolveWritingAccess(input);

    expect(result).toBe('sign-in-wall');
  });

  it('allows writing when this client has an Account session', () => {
    const input = {
      hasSession: true,
      isOnline: false,
      hasEverSignedInOnThisClient: true,
    };

    const result = resolveWritingAccess(input);

    expect(result).toBe('write');
  });

  it('allows first-run offline writing when this client has never signed in', () => {
    const input = {
      hasSession: false,
      isOnline: false,
      hasEverSignedInOnThisClient: false,
    };

    const result = resolveWritingAccess(input);

    expect(result).toBe('write');
  });

  it('blocks offline writing after this client has signed in and has no session', () => {
    const input = {
      hasSession: false,
      isOnline: false,
      hasEverSignedInOnThisClient: true,
    };

    const result = resolveWritingAccess(input);

    expect(result).toBe('offline-blocked');
  });
});
