import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LambdaApi } from '../lib/api.js';
import { LambdaApiProvider, useLambdaApi } from './LambdaApiContext.js';

describe('useLambdaApi', () => {
  it('throws when used outside LambdaApiProvider', () => {
    const attempt = () => renderHook(() => useLambdaApi());

    expect(attempt).toThrow(
      'useLambdaApi must be used within LambdaApiProvider',
    );
  });

  it('returns the provided api', () => {
    const api = {
      platform: 'web',
    } as LambdaApi;

    const { result } = renderHook(() => useLambdaApi(), {
      wrapper: ({ children }) => (
        <LambdaApiProvider api={api}>{children}</LambdaApiProvider>
      ),
    });

    expect(result.current).toBe(api);
  });
});
