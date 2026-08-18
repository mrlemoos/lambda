import { describe, expect, it } from 'vitest';

import { resolveLambdaWebOrigin } from './resolveLambdaWebOrigin.js';

describe('resolveLambdaWebOrigin', () => {
  it('uses the Vite Lambda Web origin when unpackaged and env is empty', () => {
    const isPackaged = false;
    const originFromEnv = undefined;

    const result = resolveLambdaWebOrigin({ isPackaged, originFromEnv });

    expect(result).toBe('http://localhost:4300');
  });

  it('uses LAMBDA_WEB_ORIGIN when set', () => {
    const isPackaged = false;
    const originFromEnv = 'http://127.0.0.1:3000';

    const result = resolveLambdaWebOrigin({ isPackaged, originFromEnv });

    expect(result).toBe('http://127.0.0.1:3000');
  });

  it('uses LAMBDA_WEB_ORIGIN when packaged', () => {
    const isPackaged = true;
    const originFromEnv = 'https://lambda.example';

    const result = resolveLambdaWebOrigin({ isPackaged, originFromEnv });

    expect(result).toBe('https://lambda.example');
  });

  it('throws when packaged and LAMBDA_WEB_ORIGIN is missing', () => {
    const isPackaged = true;
    const originFromEnv = undefined;

    const attempt = () => resolveLambdaWebOrigin({ isPackaged, originFromEnv });

    expect(attempt).toThrow(/LAMBDA_WEB_ORIGIN/);
  });

  it('rejects a non-http LAMBDA_WEB_ORIGIN', () => {
    const isPackaged = false;
    const originFromEnv = 'javascript:alert(1)';

    const attempt = () => resolveLambdaWebOrigin({ isPackaged, originFromEnv });

    expect(attempt).toThrow(/http/);
  });
});
