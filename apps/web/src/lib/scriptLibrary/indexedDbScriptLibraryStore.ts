import type { ScriptLibraryStore } from './types.js';

const DB_NAME = 'lambda-script-library';
const DB_VERSION = 1;
const SCRIPTS_STORE = 'scripts';
const META_STORE = 'meta';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Could not open script library.'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(SCRIPTS_STORE)) {
        const scripts = database.createObjectStore(SCRIPTS_STORE, {
          keyPath: 'id',
        });
        scripts.createIndex('updatedAtMs', 'updatedAtMs');
      }

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function runTransaction<T>(
  database: IDBDatabase,
  storeNames: string | string[],
  mode: IDBTransactionMode,
  run: (transaction: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeNames, mode);

    transaction.onerror = () => {
      reject(
        transaction.error ?? new Error('Script library transaction failed.'),
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ?? new Error('Script library transaction aborted.'),
      );
    };

    Promise.resolve(run(transaction))
      .then((value) => {
        transaction.oncomplete = () => {
          resolve(value);
        };
      })
      .catch(reject);
  });
}

export function createIndexedDbScriptLibraryStore(): ScriptLibraryStore {
  let databasePromise: Promise<IDBDatabase> | null = null;

  function getDatabase(): Promise<IDBDatabase> {
    if (!databasePromise) {
      databasePromise = openDatabase();
    }

    return databasePromise;
  }

  return {
    async list() {
      const database = await getDatabase();

      return runTransaction(
        database,
        SCRIPTS_STORE,
        'readonly',
        (transaction) => {
          return new Promise((resolve, reject) => {
            const request = transaction.objectStore(SCRIPTS_STORE).getAll();

            request.onerror = () => {
              reject(request.error ?? new Error('Could not list scripts.'));
            };

            request.onsuccess = () => {
              const records = (request.result ?? []) as Array<{
                id: string;
                displayName: string;
                updatedAtMs: number;
              }>;

              resolve(
                records
                  .map(({ id, displayName, updatedAtMs }) => ({
                    id,
                    displayName,
                    updatedAtMs,
                  }))
                  .sort((left, right) => right.updatedAtMs - left.updatedAtMs),
              );
            };
          });
        },
      );
    },

    async get(id) {
      const database = await getDatabase();

      return runTransaction(
        database,
        SCRIPTS_STORE,
        'readonly',
        (transaction) => {
          return new Promise((resolve, reject) => {
            const request = transaction.objectStore(SCRIPTS_STORE).get(id);

            request.onerror = () => {
              reject(request.error ?? new Error('Could not load script.'));
            };

            request.onsuccess = () => {
              resolve(request.result ?? null);
            };
          });
        },
      );
    },

    async put(record) {
      const database = await getDatabase();

      await runTransaction(
        database,
        SCRIPTS_STORE,
        'readwrite',
        (transaction) => {
          transaction.objectStore(SCRIPTS_STORE).put(record);
        },
      );
    },

    async delete(id) {
      const database = await getDatabase();

      await runTransaction(
        database,
        SCRIPTS_STORE,
        'readwrite',
        (transaction) => {
          transaction.objectStore(SCRIPTS_STORE).delete(id);
        },
      );
    },

    async getMeta(key) {
      const database = await getDatabase();

      return runTransaction(database, META_STORE, 'readonly', (transaction) => {
        return new Promise((resolve, reject) => {
          const request = transaction.objectStore(META_STORE).get(key);

          request.onerror = () => {
            reject(
              request.error ?? new Error('Could not read library metadata.'),
            );
          };

          request.onsuccess = () => {
            const value = request.result;

            resolve(typeof value === 'string' ? value : null);
          };
        });
      });
    },

    async setMeta(key, value) {
      const database = await getDatabase();

      await runTransaction(database, META_STORE, 'readwrite', (transaction) => {
        const store = transaction.objectStore(META_STORE);

        if (value === null) {
          store.delete(key);
          return;
        }

        store.put(value, key);
      });
    },
  };
}
