import type { LambdaApi } from '@lambda/lambda-api';

declare global {
  interface Window {
    lambda: LambdaApi;
  }
}

export {};
