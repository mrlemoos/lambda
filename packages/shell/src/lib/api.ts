import type { PageFormat } from '@lambda/fountain';

export type ExportPdfOptions = {
  pageFormat: PageFormat;
  defaultName?: string;
};

export type FileCommand =
  | 'new'
  | 'open'
  | 'save'
  | 'save-as'
  | 'title-page'
  | 'preview';

export type ViewCommand = 'in' | 'out' | 'actual-size';

export type LambdaPlatform = 'darwin' | 'linux' | 'win32' | 'web';

export type ScriptLibraryEntry = {
  id: string;
  displayName: string;
  updatedAtMs: number;
};

export type PersistScriptResult = {
  id: string | null;
  displayName: string;
  persisted: boolean;
};

export type ScriptPersistenceApi = {
  persistScript: (args: {
    id: string | null;
    text: string;
    importFileName?: string | null;
  }) => Promise<PersistScriptResult>;
  loadScript: (id: string) => Promise<string | null>;
  listScripts: () => Promise<ScriptLibraryEntry[]>;
  deleteScript: (id: string) => Promise<void>;
  getLastOpenScriptId: () => Promise<string | null>;
  setLastOpenScriptId: (id: string | null) => Promise<void>;
  loadSessionDraft: () => string | null;
  saveSessionDraft: (text: string) => void;
  clearSessionDraft: () => void;
  scheduleAutosave: (args: {
    id: string | null;
    text: string;
    importFileName?: string | null;
    onPendingChange: (pending: boolean) => void;
    onPersisted: (result: PersistScriptResult) => void;
  }) => void;
  cancelAutosave: () => void;
  flushPendingPersist: () => Promise<PersistScriptResult | null>;
};

export type LambdaApi = {
  platform: LambdaPlatform;
  onFileCommand: (listener: (command: FileCommand) => void) => () => void;
  onViewCommand: (listener: (command: ViewCommand) => void) => () => void;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, contents: string) => Promise<string>;
  showOpenDialog: () => Promise<string | null>;
  showSaveDialog: (defaultName?: string) => Promise<string | null>;
  setWindowTitle: (title: string) => Promise<void>;
  exportPdf?: (options: ExportPdfOptions) => Promise<void>;
  scriptPersistence?: ScriptPersistenceApi;
};
