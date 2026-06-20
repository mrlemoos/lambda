import type { LambdaApi } from '@lambda/shell';

declare global {
  interface Window {
    lambda: LambdaApi;
  }
}

export {};
