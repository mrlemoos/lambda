import { createAuthClient } from 'better-auth/react';

let lambdaAuthClient: ReturnType<typeof createAuthClient> | undefined;

export function createLambdaAuthClient() {
  return (lambdaAuthClient ??= createAuthClient());
}
