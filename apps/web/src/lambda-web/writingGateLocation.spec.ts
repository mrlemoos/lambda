import { describe, expect, it } from 'vitest';

import { writingGateLocation } from './writingGateLocation.js';

describe('writingGateLocation', () => {
  it('does not redirect when writing is allowed', () => {
    const result = writingGateLocation('write');

    expect(result).toBeNull();
  });

  it('sends an unsigned-in online client to sign-in', () => {
    const result = writingGateLocation('sign-in-wall');

    expect(result).toBe('/sign-in');
  });

  it('sends an offline-blocked client to welcome', () => {
    const result = writingGateLocation('offline-blocked');

    expect(result).toBe('/');
  });
});
