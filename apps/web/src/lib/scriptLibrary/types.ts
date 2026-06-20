export type LibraryScriptRecord = {
  id: string;
  text: string;
  displayName: string;
  importFileName: string | null;
  updatedAtMs: number;
};

export type LibraryScriptSummary = {
  id: string;
  displayName: string;
  updatedAtMs: number;
};

export type PersistScriptResult = {
  id: string | null;
  displayName: string;
  persisted: boolean;
};

export type ScriptLibraryStore = {
  list: () => Promise<LibraryScriptSummary[]>;
  get: (id: string) => Promise<LibraryScriptRecord | null>;
  put: (record: LibraryScriptRecord) => Promise<void>;
  delete: (id: string) => Promise<void>;
  getMeta: (key: string) => Promise<string | null>;
  setMeta: (key: string, value: string | null) => Promise<void>;
};
