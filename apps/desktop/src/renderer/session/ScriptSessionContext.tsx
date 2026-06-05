import {
  newScriptStub,
  parseFountain,
  stringifyFountain,
  type FountainScript,
} from '@lambda/fountain';
import type { JSONContent } from '@tiptap/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { isDirty } from '../../lib/isDirty.js';
import { formatWindowTitle } from '../../lib/windowTitle.js';

export type UnsavedChoice = 'save' | 'discard' | 'cancel';

type ScriptSessionContextValue = {
  script: FountainScript | null;
  filePath: string | null;
  dirty: boolean;
  startNewScript: () => Promise<void>;
  openScriptFromDisk: () => Promise<void>;
  updateDocument: (document: JSONContent) => void;
  saveScript: () => Promise<boolean>;
  saveScriptAs: () => Promise<boolean>;
  confirmUnsavedChanges: () => Promise<UnsavedChoice>;
  openError: string | null;
  clearOpenError: () => void;
};

const ScriptSessionContext = createContext<ScriptSessionContextValue | null>(
  null,
);

function createSessionFromText(
  text: string,
  filePath: string | null,
): { script: FountainScript; savedText: string; filePath: string | null } {
  return {
    script: parseFountain(text),
    savedText: text,
    filePath,
  };
}

export function ScriptSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [script, setScript] = useState<FountainScript | null>(null);
  const [savedText, setSavedText] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [openError, setOpenError] = useState<string | null>(null);

  const dirty = script ? isDirty(savedText, currentText) : false;

  const syncWindowTitle = useCallback(
    async (path: string | null, edited: boolean) => {
      const fileName = path ? (path.split('/').pop() ?? path) : null;
      await window.lambda.setWindowTitle(
        formatWindowTitle({ fileName, isDirty: edited }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!script) {
      return;
    }

    void syncWindowTitle(filePath, dirty);
  }, [script, filePath, dirty, syncWindowTitle]);

  const applySession = useCallback(
    (
      nextScript: FountainScript,
      nextSavedText: string,
      path: string | null,
    ) => {
      setScript(nextScript);
      setSavedText(nextSavedText);
      setCurrentText(nextSavedText);
      setFilePath(path);
      navigate('/script');
    },
    [navigate],
  );

  const [unsavedPromptOpen, setUnsavedPromptOpen] = useState(false);
  const unsavedResolverRef = useRef<((choice: UnsavedChoice) => void) | null>(
    null,
  );

  const confirmUnsavedChanges = useCallback((): Promise<UnsavedChoice> => {
    if (!dirty) {
      return Promise.resolve('discard');
    }

    return new Promise((resolve) => {
      unsavedResolverRef.current = resolve;
      setUnsavedPromptOpen(true);
    });
  }, [dirty]);

  const updateDocument = useCallback((document: JSONContent) => {
    setScript((previous) => {
      if (!previous) {
        return previous;
      }

      const nextScript = { ...previous, document };
      setCurrentText(stringifyFountain(nextScript));

      return nextScript;
    });
  }, []);

  const persistToPath = useCallback(
    async (path: string): Promise<boolean> => {
      if (!script) {
        return false;
      }

      const text = stringifyFountain(script);
      const fileName = await window.lambda.writeFile(path, text);
      setSavedText(text);
      setCurrentText(text);
      setFilePath(path);
      await syncWindowTitle(path, false);

      if (fileName) {
        return true;
      }

      return true;
    },
    [script, syncWindowTitle],
  );

  const saveScript = useCallback(async (): Promise<boolean> => {
    if (!script) {
      return false;
    }

    if (!filePath) {
      const path = await window.lambda.showSaveDialog('Untitled.fountain');

      if (!path) {
        return false;
      }

      return persistToPath(path);
    }

    return persistToPath(filePath);
  }, [filePath, persistToPath, script]);

  const saveScriptAs = useCallback(async (): Promise<boolean> => {
    if (!script) {
      return false;
    }

    const path = await window.lambda.showSaveDialog(
      filePath?.split('/').pop() ?? 'Untitled.fountain',
    );

    if (!path) {
      return false;
    }

    return persistToPath(path);
  }, [filePath, persistToPath, script]);

  const clearOpenError = useCallback(() => {
    setOpenError(null);
  }, []);

  const openScriptFromDiskWithoutConfirm = useCallback(async () => {
    setOpenError(null);

    const path = await window.lambda.showOpenDialog();

    if (!path) {
      return;
    }

    try {
      const text = await window.lambda.readFile(path);
      const session = createSessionFromText(text, path);
      applySession(session.script, session.savedText, session.filePath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not open this file.';

      setOpenError(message);
      navigate('/');
    }
  }, [applySession, navigate]);

  const openScriptFromDisk = useCallback(async () => {
    const choice = await confirmUnsavedChanges();

    if (choice === 'cancel') {
      return;
    }

    await openScriptFromDiskWithoutConfirm();
  }, [confirmUnsavedChanges, openScriptFromDiskWithoutConfirm]);

  const startNewScript = useCallback(async () => {
    const choice = await confirmUnsavedChanges();

    if (choice === 'cancel') {
      return;
    }

    const text = newScriptStub();
    const session = createSessionFromText(text, null);
    applySession(session.script, session.savedText, session.filePath);
  }, [applySession, confirmUnsavedChanges]);

  const resolveUnsavedPrompt = useCallback(
    async (choice: UnsavedChoice) => {
      const resolve = unsavedResolverRef.current;
      unsavedResolverRef.current = null;
      setUnsavedPromptOpen(false);

      if (!resolve) {
        return;
      }

      if (choice === 'save') {
        const saved = await saveScript();
        resolve(saved ? 'save' : 'cancel');
        return;
      }

      resolve(choice);
    },
    [saveScript],
  );

  useEffect(() => {
    const unsubscribe = window.lambda.onFileCommand(async (command) => {
      if (command === 'new') {
        const choice = await confirmUnsavedChanges();

        if (choice === 'cancel') {
          return;
        }

        startNewScript();
        return;
      }

      if (command === 'open') {
        await openScriptFromDisk();
        return;
      }

      if (command === 'save') {
        await saveScript();
        return;
      }

      if (command === 'save-as') {
        await saveScriptAs();
      }
    });

    return unsubscribe;
  }, [
    confirmUnsavedChanges,
    openScriptFromDisk,
    saveScript,
    saveScriptAs,
    startNewScript,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirty]);

  const value = useMemo(
    () => ({
      script,
      filePath,
      dirty,
      startNewScript,
      openScriptFromDisk,
      updateDocument,
      saveScript,
      saveScriptAs,
      confirmUnsavedChanges,
      openError,
      clearOpenError,
    }),
    [
      script,
      filePath,
      dirty,
      startNewScript,
      openScriptFromDisk,
      updateDocument,
      saveScript,
      saveScriptAs,
      confirmUnsavedChanges,
      openError,
      clearOpenError,
    ],
  );

  return (
    <ScriptSessionContext.Provider value={value}>
      {children}
      {unsavedPromptOpen ? (
        <div className="unsaved-modal-backdrop" role="presentation">
          <dialog className="unsaved-modal" open>
            <p>Save changes to this script before continuing?</p>
            <div className="unsaved-modal-actions">
              <button
                type="button"
                onClick={() => void resolveUnsavedPrompt('save')}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => void resolveUnsavedPrompt('discard')}
              >
                Don&apos;t save
              </button>
              <button
                type="button"
                onClick={() => void resolveUnsavedPrompt('cancel')}
              >
                Cancel
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </ScriptSessionContext.Provider>
  );
}

export function useScriptSession(): ScriptSessionContextValue {
  const context = useContext(ScriptSessionContext);

  if (!context) {
    throw new Error(
      'useScriptSession must be used within ScriptSessionProvider',
    );
  }

  return context;
}
