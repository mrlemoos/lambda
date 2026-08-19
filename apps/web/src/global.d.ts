declare global {
  interface Window {
    showOpenFilePicker?: (options?: {
      types?: Array<{ accept: Record<string, string[]> }>;
      multiple?: boolean;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{ accept: Record<string, string[]> }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

export {};
