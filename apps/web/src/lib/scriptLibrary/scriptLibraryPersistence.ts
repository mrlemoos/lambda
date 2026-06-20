import {
  resolveScriptDisplayName,
  shouldPersistToLibrary,
} from './scriptDisplayName.js';
import {
  clearSessionDraft,
  loadSessionDraft,
  saveSessionDraft,
} from './sessionDraft.js';
import { LAST_OPEN_SCRIPT_ID_KEY } from './metaKeys.js';
import type { PersistScriptResult, ScriptLibraryStore } from './types.js';

export type ScheduleAutosaveArgs = {
  id: string | null;
  text: string;
  importFileName?: string | null;
  onPendingChange: (pending: boolean) => void;
  onPersisted: (result: PersistScriptResult) => void;
};

export type PersistScriptArgs = {
  id: string | null;
  text: string;
  importFileName?: string | null;
};

export type ScriptLibraryPersistence = {
  persistScript: (args: PersistScriptArgs) => Promise<PersistScriptResult>;
  loadScript: (id: string) => Promise<string | null>;
  listScripts: () => Promise<
    Array<{ id: string; displayName: string; updatedAtMs: number }>
  >;
  deleteScript: (id: string) => Promise<void>;
  getLastOpenScriptId: () => Promise<string | null>;
  setLastOpenScriptId: (id: string | null) => Promise<void>;
  loadSessionDraft: () => string | null;
  saveSessionDraft: (text: string) => void;
  clearSessionDraft: () => void;
  scheduleAutosave: (args: ScheduleAutosaveArgs) => void;
  cancelAutosave: () => void;
  flushPendingPersist: () => Promise<PersistScriptResult | null>;
};

type CreateScriptLibraryPersistenceOptions = {
  autosaveDelayMs?: number;
  createId?: () => string;
  now?: () => number;
};

function defaultCreateId(): string {
  return crypto.randomUUID();
}

export function createScriptLibraryPersistence(
  store: ScriptLibraryStore,
  options: CreateScriptLibraryPersistenceOptions = {},
): ScriptLibraryPersistence {
  const autosaveDelayMs = options.autosaveDelayMs ?? 1500;
  const createId = options.createId ?? defaultCreateId;
  const now = options.now ?? (() => Date.now());

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPersist: PersistScriptArgs | null = null;
  let pendingCallbacks: {
    onPendingChange: (pending: boolean) => void;
    onPersisted: (result: PersistScriptResult) => void;
  } | null = null;

  async function persistScript({
    id,
    text,
    importFileName = null,
  }: PersistScriptArgs): Promise<PersistScriptResult> {
    const displayName = resolveScriptDisplayName(text, importFileName);

    if (!shouldPersistToLibrary(text, importFileName)) {
      saveSessionDraft(text);
      await setLastOpenScriptId(null);

      return {
        id: null,
        displayName,
        persisted: false,
      };
    }

    const scriptId = id ?? createId();
    const existing = await store.get(scriptId);

    await store.put({
      id: scriptId,
      text,
      displayName,
      importFileName: existing?.importFileName ?? importFileName,
      updatedAtMs: now(),
    });
    clearSessionDraft();
    await setLastOpenScriptId(scriptId);

    return {
      id: scriptId,
      displayName,
      persisted: true,
    };
  }

  async function loadScript(id: string): Promise<string | null> {
    const record = await store.get(id);

    return record?.text ?? null;
  }

  async function listScripts() {
    return store.list();
  }

  async function deleteScript(id: string): Promise<void> {
    await store.delete(id);

    const lastOpenScriptId = await getLastOpenScriptId();

    if (lastOpenScriptId === id) {
      await setLastOpenScriptId(null);
    }
  }

  async function getLastOpenScriptId(): Promise<string | null> {
    return store.getMeta(LAST_OPEN_SCRIPT_ID_KEY);
  }

  async function setLastOpenScriptId(id: string | null): Promise<void> {
    await store.setMeta(LAST_OPEN_SCRIPT_ID_KEY, id);
  }

  function cancelAutosave(): void {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }

    pendingPersist = null;
    pendingCallbacks = null;
  }

  function scheduleAutosave({
    id,
    text,
    importFileName = null,
    onPendingChange,
    onPersisted,
  }: ScheduleAutosaveArgs): void {
    pendingPersist = { id, text, importFileName };
    pendingCallbacks = { onPendingChange, onPersisted };
    onPendingChange(true);

    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }

    autosaveTimer = setTimeout(() => {
      void flushPendingPersist();
    }, autosaveDelayMs);
  }

  async function flushPendingPersist(): Promise<PersistScriptResult | null> {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }

    if (!pendingPersist) {
      return null;
    }

    const args = pendingPersist;
    const callbacks = pendingCallbacks;
    pendingPersist = null;
    pendingCallbacks = null;

    const result = await persistScript(args);
    callbacks?.onPendingChange(false);
    callbacks?.onPersisted(result);

    return result;
  }

  return {
    persistScript,
    loadScript,
    listScripts,
    deleteScript,
    getLastOpenScriptId,
    setLastOpenScriptId,
    loadSessionDraft: loadSessionDraft,
    saveSessionDraft,
    clearSessionDraft,
    scheduleAutosave,
    cancelAutosave,
    flushPendingPersist,
  };
}
