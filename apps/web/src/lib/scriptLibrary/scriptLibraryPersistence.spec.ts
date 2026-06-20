import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMemoryScriptLibraryStore } from './memoryScriptLibraryStore.js';
import { createScriptLibraryPersistence } from './scriptLibraryPersistence.js';

describe('createScriptLibraryPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persists titled scripts to the library store', async () => {
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store);
    const text = `Title: JULIE

INT. HOUSE - DAY
`;

    const result = await persistence.persistScript({
      id: null,
      text,
    });

    expect(result).toEqual({
      id: expect.any(String),
      displayName: 'JULIE',
      persisted: true,
    });
    expect(await store.list()).toHaveLength(1);
  });

  it('stores untitled scripts in session storage only', async () => {
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store);
    const text = `Title:

Credit: Written by
Author:

`;

    const result = await persistence.persistScript({
      id: null,
      text,
    });

    expect(result).toEqual({
      id: null,
      displayName: 'Untitled',
      persisted: false,
    });
    expect(await store.list()).toHaveLength(0);
    expect(persistence.loadSessionDraft()).toBe(text);
  });

  it('promotes an untitled draft into the library once a title is added', async () => {
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store);
    const untitled = `Title:

Credit: Written by
Author:

`;
    const titled = `Title: JULIE

INT. HOUSE - DAY
`;

    await persistence.persistScript({ id: null, text: untitled });
    const result = await persistence.persistScript({ id: null, text: titled });

    expect(result.persisted).toBe(true);
    expect(result.displayName).toBe('JULIE');
    expect(persistence.loadSessionDraft()).toBeNull();
  });

  it('imports disk files using the filename when no title metadata exists', async () => {
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store);

    const result = await persistence.persistScript({
      id: null,
      text: 'INT. HOUSE - DAY\n',
      importFileName: 'house.fountain',
    });

    expect(result).toEqual({
      id: expect.any(String),
      displayName: 'house',
      persisted: true,
    });
  });

  it('debounces autosave and reports pending state', async () => {
    vi.useFakeTimers();
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store, {
      autosaveDelayMs: 1000,
    });
    const onPendingChange = vi.fn();
    const onPersisted = vi.fn();
    const text = `Title: JULIE

INT. HOUSE - DAY
`;

    persistence.scheduleAutosave({
      id: null,
      text,
      onPendingChange,
      onPersisted,
    });

    expect(onPendingChange).toHaveBeenCalledWith(true);

    await vi.advanceTimersByTimeAsync(999);

    expect(onPendingChange).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    expect(onPendingChange).toHaveBeenLastCalledWith(false);
    expect(onPersisted).toHaveBeenCalledWith({
      id: expect.any(String),
      displayName: 'JULIE',
      persisted: true,
    });

    vi.useRealTimers();
  });

  it('flushes pending autosave immediately', async () => {
    vi.useFakeTimers();
    const store = createMemoryScriptLibraryStore();
    const persistence = createScriptLibraryPersistence(store, {
      autosaveDelayMs: 5000,
    });
    const text = `Title: JULIE

INT. HOUSE - DAY
`;

    persistence.scheduleAutosave({
      id: null,
      text,
      onPendingChange: vi.fn(),
      onPersisted: vi.fn(),
    });

    const result = await persistence.flushPendingPersist();

    expect(result?.displayName).toBe('JULIE');
    expect(await store.list()).toHaveLength(1);

    vi.useRealTimers();
  });
});
