import { createContext, useContext, type ReactNode } from 'react';

import type { LambdaApi } from '../lib/api.js';

const LambdaApiContext = createContext<LambdaApi | null>(null);

export function LambdaApiProvider({
  api,
  children,
}: {
  api: LambdaApi;
  children: ReactNode;
}) {
  return (
    <LambdaApiContext.Provider value={api}>
      {children}
    </LambdaApiContext.Provider>
  );
}

export function useLambdaApi(): LambdaApi {
  const api = useContext(LambdaApiContext);

  if (!api) {
    throw new Error('useLambdaApi must be used within LambdaApiProvider');
  }

  return api;
}
