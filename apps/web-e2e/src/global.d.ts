export type LambdaE2eApi = {
  getFountainText: () => string;
  getLastWrittenContents: () => string | null;
  clearLastWrittenContents: () => void;
};

declare global {
  interface Window {
    __lambdaE2e?: LambdaE2eApi;
  }
}

export {};
