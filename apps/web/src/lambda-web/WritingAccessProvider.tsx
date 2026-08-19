'use client';

import {
  createLambdaAuthClient,
  getHasEverSignedInStorage,
  syncHasEverSignedInOnThisClient,
} from '@lambda/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isLambdaWebE2e } from '../lib/isLambdaWebE2e.js';
import { composeWritingAccess } from './composeWritingAccess.js';

type AuthSessionSnapshot = {
  data: { session?: unknown } | null;
  isPending: boolean;
};

export type WritingAccessAuthClient = {
  useSession: () => AuthSessionSnapshot;
};

export type WritingAccessValue = {
  writingAccess: ReturnType<typeof composeWritingAccess>;
  hasSession: boolean;
  isPending: boolean;
};

const WritingAccessContext = createContext<WritingAccessValue | null>(null);

const defaultAuthClient = createLambdaAuthClient();

export type WritingAccessProviderProps = {
  children: ReactNode;
  authClient?: WritingAccessAuthClient;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  isOnline?: boolean;
  isE2e?: boolean;
};

export function WritingAccessProvider({
  children,
  authClient = defaultAuthClient as WritingAccessAuthClient,
  storage = getHasEverSignedInStorage(),
  isOnline: isOnlineOverride,
  isE2e = isLambdaWebE2e(),
}: WritingAccessProviderProps) {
  const session = authClient.useSession();
  const [browserOnline, setBrowserOnline] = useState(
    () => globalThis.navigator?.onLine ?? true,
  );

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    globalThis.addEventListener?.('online', handleOnline);
    globalThis.addEventListener?.('offline', handleOffline);

    return () => {
      globalThis.removeEventListener?.('online', handleOnline);
      globalThis.removeEventListener?.('offline', handleOffline);
    };
  }, []);

  const isOnline = isOnlineOverride ?? browserOnline;
  const hasSession = Boolean(session.data?.session);
  const hasEverSignedInOnThisClient = syncHasEverSignedInOnThisClient(
    hasSession,
    storage,
  );
  const writingAccess = composeWritingAccess({
    hasSession,
    isOnline,
    hasEverSignedInOnThisClient,
    isE2e,
  });

  const value = useMemo(
    (): WritingAccessValue => ({
      writingAccess,
      hasSession,
      isPending: isE2e ? false : session.isPending,
    }),
    [hasSession, isE2e, session.isPending, writingAccess],
  );

  return (
    <WritingAccessContext.Provider value={value}>
      {children}
    </WritingAccessContext.Provider>
  );
}

export function useWritingAccess(): WritingAccessValue {
  const value = useContext(WritingAccessContext);

  if (!value) {
    throw new Error(
      'useWritingAccess must be used within WritingAccessProvider',
    );
  }

  return value;
}
