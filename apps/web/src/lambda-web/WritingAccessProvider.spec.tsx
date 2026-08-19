import { describe, expect, it } from 'vitest';

import { HAS_EVER_SIGNED_IN_STORAGE_KEY } from '@lambda/auth';
import { render, screen } from '@testing-library/react';

import {
  useWritingAccess,
  WritingAccessProvider,
} from './WritingAccessProvider.js';

describe('WritingAccessProvider', () => {
  it('exposes the sign-in wall when online without a session', () => {
    const storage = createMemoryStorage();

    render(
      <WritingAccessProvider
        authClient={createAuthClient({ data: null, isPending: false })}
        storage={storage}
        isOnline
        isE2e={false}
      >
        <AccessProbe />
      </WritingAccessProvider>,
    );

    const result = screen.getByText('sign-in-wall');

    expect(result).toBeInTheDocument();
  });

  it('records that this client has signed in when a session appears', () => {
    const storage = createMemoryStorage();

    render(
      <WritingAccessProvider
        authClient={createAuthClient({
          data: { session: { id: 'sess' } },
          isPending: false,
        })}
        storage={storage}
        isOnline
        isE2e={false}
      >
        <AccessProbe />
      </WritingAccessProvider>,
    );

    const result = storage.getItem(HAS_EVER_SIGNED_IN_STORAGE_KEY);

    expect(result).toBe('1');
  });

  it('allows writing during Lambda Web e2e even without a session', () => {
    const storage = createMemoryStorage();

    render(
      <WritingAccessProvider
        authClient={createAuthClient({ data: null, isPending: false })}
        storage={storage}
        isOnline
        isE2e
      >
        <AccessProbe />
      </WritingAccessProvider>,
    );

    const result = screen.getByText('write');

    expect(result).toBeInTheDocument();
  });

  it('allows first-run offline writing when this client has never signed in', () => {
    const storage = createMemoryStorage();

    render(
      <WritingAccessProvider
        authClient={createAuthClient({ data: null, isPending: false })}
        storage={storage}
        isOnline={false}
        isE2e={false}
      >
        <AccessProbe />
      </WritingAccessProvider>,
    );

    const result = screen.getByText('write');

    expect(result).toBeInTheDocument();
  });
});

function AccessProbe() {
  const { writingAccess } = useWritingAccess();

  return <p>{writingAccess}</p>;
}

function createAuthClient(session: {
  data: { session?: unknown } | null;
  isPending: boolean;
}) {
  return {
    useSession: () => session,
  };
}

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
