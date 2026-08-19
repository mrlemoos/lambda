export const HAS_EVER_SIGNED_IN_STORAGE_KEY =
  'lambda-auth-has-ever-signed-in-on-this-client';

export function syncHasEverSignedInOnThisClient(
  hasSession: boolean,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): boolean {
  if (hasSession) {
    storage.setItem(HAS_EVER_SIGNED_IN_STORAGE_KEY, '1');
    return true;
  }

  return storage.getItem(HAS_EVER_SIGNED_IN_STORAGE_KEY) === '1';
}

export function getHasEverSignedInStorage(): Pick<
  Storage,
  'getItem' | 'setItem'
> {
  try {
    const { localStorage } = globalThis;

    if (
      localStorage &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function'
    ) {
      return localStorage;
    }
  } catch {
    // Access can fail in private browsing or test environments.
  }

  return {
    getItem: () => null,
    setItem: () => undefined,
  };
}
