import type { LambdaApi } from '../preload/api.js';

declare global {
  interface Window {
    lambda: LambdaApi;
  }
}

export {};
