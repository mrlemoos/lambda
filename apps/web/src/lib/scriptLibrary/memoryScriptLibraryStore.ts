import type { LibraryScriptRecord, ScriptLibraryStore } from './types.js';

export function createMemoryScriptLibraryStore(): ScriptLibraryStore {
  const scripts = new Map<string, LibraryScriptRecord>();
  const meta = new Map<string, string>();

  return {
    async list() {
      return [...scripts.values()]
        .map(({ id, displayName, updatedAtMs }) => ({
          id,
          displayName,
          updatedAtMs,
        }))
        .sort((left, right) => right.updatedAtMs - left.updatedAtMs);
    },

    async get(id) {
      return scripts.get(id) ?? null;
    },

    async put(record) {
      scripts.set(record.id, record);
    },

    async delete(id) {
      scripts.delete(id);
    },

    async getMeta(key) {
      return meta.get(key) ?? null;
    },

    async setMeta(key, value) {
      if (value === null) {
        meta.delete(key);
        return;
      }

      meta.set(key, value);
    },
  };
}
