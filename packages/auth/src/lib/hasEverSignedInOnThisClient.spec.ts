import { describe, expect, it } from 'vitest';

import {
  HAS_EVER_SIGNED_IN_STORAGE_KEY,
  syncHasEverSignedInOnThisClient,
} from './hasEverSignedInOnThisClient.js';

describe('syncHasEverSignedInOnThisClient', () => {
  it('persists that this client has signed in when a session is present', () => {
    const storage = createMemoryStorage();

    const result = syncHasEverSignedInOnThisClient(true, storage);

    expect(result).toBe(true);
    expect(storage.getItem(HAS_EVER_SIGNED_IN_STORAGE_KEY)).toBe('1');
  });

  it('reports that this client has signed in after a session was stored', () => {
    const storage = createMemoryStorage();
    storage.setItem(HAS_EVER_SIGNED_IN_STORAGE_KEY, '1');

    const result = syncHasEverSignedInOnThisClient(false, storage);

    expect(result).toBe(true);
  });

  it('reports that this client has never signed in when storage is empty', () => {
    const storage = createMemoryStorage();

    const result = syncHasEverSignedInOnThisClient(false, storage);

    expect(result).toBe(false);
  });
});

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
