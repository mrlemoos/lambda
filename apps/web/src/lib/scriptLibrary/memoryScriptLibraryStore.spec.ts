import { describe, expect, it } from 'vitest';

import { createMemoryScriptLibraryStore } from './memoryScriptLibraryStore.js';

describe('createMemoryScriptLibraryStore', () => {
  it('lists scripts sorted by last edited descending', async () => {
    const store = createMemoryScriptLibraryStore();

    await store.put({
      id: 'older',
      text: 'Older\n',
      displayName: 'Older',
      importFileName: null,
      updatedAtMs: 100,
    });
    await store.put({
      id: 'newer',
      text: 'Newer\n',
      displayName: 'Newer',
      importFileName: null,
      updatedAtMs: 200,
    });

    const result = await store.list();

    expect(result).toEqual([
      { id: 'newer', displayName: 'Newer', updatedAtMs: 200 },
      { id: 'older', displayName: 'Older', updatedAtMs: 100 },
    ]);
  });

  it('stores and reads meta values', async () => {
    const store = createMemoryScriptLibraryStore();

    await store.setMeta('lastOpenScriptId', 'abc');

    const result = await store.getMeta('lastOpenScriptId');

    expect(result).toBe('abc');
  });

  it('deletes scripts from the store', async () => {
    const store = createMemoryScriptLibraryStore();

    await store.put({
      id: 'gone',
      text: 'Gone\n',
      displayName: 'Gone',
      importFileName: null,
      updatedAtMs: 1,
    });

    await store.delete('gone');

    const result = await store.get('gone');

    expect(result).toBeNull();
  });
});
