import { createIndexedDbScriptLibraryStore } from './indexedDbScriptLibraryStore.js';
import { createMemoryScriptLibraryStore } from './memoryScriptLibraryStore.js';
import {
  createScriptLibraryPersistence,
  type ScriptLibraryPersistence,
} from './scriptLibraryPersistence.js';

export type { ScriptLibraryPersistence } from './scriptLibraryPersistence.js';
export type {
  LibraryScriptRecord,
  LibraryScriptSummary,
  PersistScriptResult,
} from './types.js';
export {
  isUntitledDisplayName,
  resolveScriptDisplayName,
  shouldPersistToLibrary,
} from './scriptDisplayName.js';

export function createWebScriptLibraryPersistence(): ScriptLibraryPersistence {
  const store =
    typeof indexedDB === 'undefined'
      ? createMemoryScriptLibraryStore()
      : createIndexedDbScriptLibraryStore();

  return createScriptLibraryPersistence(store);
}

export {
  createIndexedDbScriptLibraryStore,
  createMemoryScriptLibraryStore,
  createScriptLibraryPersistence,
};
