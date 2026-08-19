import {
  newScriptStub,
  parseFountain,
  stringifyFountain,
  stripTitlePageFromDocument,
  type FountainScript,
  type PageFormat,
  type Typeface,
} from '@lambda/fountain';
import type { ScriptEditorSurfaceProps } from '@lambda/editor';
import { stringifyTitlePage, type TitlePageData } from '@lambda/editor';
import { applyPrintPageFormat } from '@lambda/print';
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

import type { ScriptLibraryEntry } from '@lambda/lambda-api';
import {
  ModalDialog,
  ModalDialogDescription,
  ModalDialogTitle,
} from '@lambda/design-system';
import { formatWindowTitle } from '../lib/formatWindowTitle.js';
import { isDirty } from '../lib/isDirty.js';
import { resolveTitlePageDialogInitialData } from '../lib/resolveTitlePageDialogInitialData.js';
import { useLambdaApi } from '@lambda/lambda-api';

export type UnsavedChoice = 'save' | 'discard' | 'cancel';
type ScriptDocument = Parameters<
  NonNullable<ScriptEditorSurfaceProps['onDocumentChange']>
>[0];

type ScriptSessionContextValue = {
  script: FountainScript | null;
  pageFormat: PageFormat;
  typeface: Typeface;
  editorSessionKey: number;
  filePath: string | null;
  libraryId: string | null;
  fileName: string;
  dirty: boolean;
  libraryEntries: ScriptLibraryEntry[];
  startNewScript: () => Promise<void>;
  openScriptFromDisk: () => Promise<void>;
  openScriptFromLibrary: (id: string) => Promise<void>;
  deleteLibraryScript: (id: string) => Promise<void>;
  refreshLibrary: () => Promise<void>;
  loadScriptFromText: (text: string, path?: string | null) => void;
  updateDocument: (document: ScriptDocument) => void;
  saveScript: () => Promise<boolean>;
  saveScriptAs: () => Promise<boolean>;
  confirmUnsavedChanges: () => Promise<UnsavedChoice>;
  getSerializedFountainText: () => string | null;
  openTitlePageDialog: () => void;
  closeTitlePageDialog: () => void;
  titlePageDialogOpen: boolean;
  titlePageDialogInitialData: TitlePageData | null;
  saveTitlePage: (data: TitlePageData) => void;
  openExportSettingsDialog: () => void;
  closeExportSettingsDialog: () => void;
  exportSettingsDialogOpen: boolean;
  saveExportSettings: (settings: {
    pageFormat: PageFormat;
    typeface: Typeface;
  }) => void;
  updatePageFormat: (pageFormat: PageFormat) => void;
  updateTypeface: (typeface: Typeface) => void;
  openPreview: () => void;
  exportPdf: () => Promise<void>;
  openError: string | null;
  clearOpenError: () => void;
};

const ScriptSessionContext = createContext<ScriptSessionContextValue | null>(
  null,
);

function stringifyForSave(script: FountainScript): string {
  return stringifyFountain(script, { persistDocumentSettings: true });
}

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

function fileNameFromPath(filePath: string | null): string {
  return filePath?.split(/[/\\]/).pop() || 'Untitled';
}

export type NavigateFn = (path: string) => void;

export function ScriptSessionProvider({
  children,
  navigate = () => undefined,
}: {
  children: ReactNode;
  navigate?: NavigateFn;
}) {
  const api = useLambdaApi();
  const persistence = api.scriptPersistence;
  const [script, setScript] = useState<FountainScript | null>(null);
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const [titlePageDialogOpen, setTitlePageDialogOpen] = useState(false);
  const [exportSettingsDialogOpen, setExportSettingsDialogOpen] =
    useState(false);
  const [titlePageDialogInitialData, setTitlePageDialogInitialData] =
    useState<TitlePageData | null>(null);
  const scriptRef = useRef<FountainScript | null>(null);
  const savedTextRef = useRef('');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const libraryIdRef = useRef<string | null>(null);
  const importFileNameRef = useRef<string | null>(null);
  const [sessionDisplayName, setSessionDisplayName] = useState<string | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [libraryEntries, setLibraryEntries] = useState<ScriptLibraryEntry[]>(
    [],
  );
  const [resumeChecked, setResumeChecked] = useState(!persistence);
  const fileName = sessionDisplayName ?? fileNameFromPath(filePath);

  const syncWindowTitle = useCallback(
    async (name: string | null, edited: boolean) => {
      await api.setWindowTitle(
        formatWindowTitle({
          fileName: name,
          isDirty: edited,
        }),
      );
    },
    [api],
  );

  useEffect(() => {
    if (!script) {
      return;
    }

    void syncWindowTitle(
      sessionDisplayName ?? fileNameFromPath(filePath),
      dirty,
    );
  }, [script, filePath, sessionDisplayName, dirty, syncWindowTitle]);

  const refreshLibrary = useCallback(async () => {
    if (!persistence) {
      return;
    }

    const entries = await persistence.listScripts();
    setLibraryEntries(entries);
  }, [persistence]);

  const applySession = useCallback(
    (
      nextScript: FountainScript,
      nextSavedText: string,
      path: string | null,
      nextLibraryId: string | null = null,
      nextDisplayName: string | null = null,
      nextImportFileName: string | null = null,
    ) => {
      scriptRef.current = nextScript;
      savedTextRef.current = nextSavedText;
      libraryIdRef.current = nextLibraryId;
      importFileNameRef.current = nextImportFileName;
      setScript(nextScript);
      setEditorSessionKey((key) => key + 1);
      setDirty(false);
      setFilePath(path);
      setLibraryId(nextLibraryId);
      setSessionDisplayName(nextDisplayName);
      navigate('/script');

      if (persistence) {
        void persistence.setLastOpenScriptId(nextLibraryId);
      }
    },
    [navigate, persistence],
  );

  const applyPersistResult = useCallback(
    (text: string, result: { id: string | null; displayName: string }) => {
      savedTextRef.current = text;
      libraryIdRef.current = result.id;
      setLibraryId(result.id);
      setSessionDisplayName(result.displayName);
      setDirty(false);
    },
    [],
  );

  const [unsavedPromptOpen, setUnsavedPromptOpen] = useState(false);
  const unsavedResolverRef = useRef<((choice: UnsavedChoice) => void) | null>(
    null,
  );

  const flushLibraryChanges = useCallback(async (): Promise<boolean> => {
    if (!persistence || !scriptRef.current) {
      return true;
    }

    const text = stringifyForSave(scriptRef.current);
    const result =
      (await persistence.flushPendingPersist()) ??
      (await persistence.persistScript({
        id: libraryIdRef.current,
        text,
        importFileName: importFileNameRef.current,
      }));

    applyPersistResult(text, result);
    await refreshLibrary();

    return true;
  }, [applyPersistResult, persistence, refreshLibrary]);

  const confirmUnsavedChanges =
    useCallback(async (): Promise<UnsavedChoice> => {
      if (!dirty) {
        return 'discard';
      }

      if (persistence) {
        try {
          await flushLibraryChanges();
          return 'discard';
        } catch {
          return 'cancel';
        }
      }

      return new Promise((resolve) => {
        unsavedResolverRef.current = resolve;
        setUnsavedPromptOpen(true);
      });
    }, [dirty, flushLibraryChanges, persistence]);

  const updateDocument = useCallback(
    (document: ScriptDocument) => {
      const previous = scriptRef.current;

      if (!previous) {
        return;
      }

      const nextScript = { ...previous, document };
      const nextText = stringifyFountain(nextScript);

      scriptRef.current = nextScript;
      setDirty(isDirty(savedTextRef.current, nextText));

      if (!persistence) {
        return;
      }

      persistence.scheduleAutosave({
        id: libraryIdRef.current,
        text: nextText,
        importFileName: importFileNameRef.current,
        onPendingChange: (pending) => {
          setDirty(pending || isDirty(savedTextRef.current, nextText));
        },
        onPersisted: (result) => {
          applyPersistResult(nextText, result);
          void refreshLibrary();
        },
      });
    },
    [applyPersistResult, persistence, refreshLibrary],
  );

  const openTitlePageDialog = useCallback(() => {
    const current = scriptRef.current;

    if (!current) {
      return;
    }

    setTitlePageDialogInitialData(
      resolveTitlePageDialogInitialData({
        script: current,
        savedText: savedTextRef.current,
        displayName: sessionDisplayName,
        filePath,
      }),
    );
    setTitlePageDialogOpen(true);
  }, [sessionDisplayName, filePath]);

  const applyExportSettings = useCallback(
    (nextPageFormat: PageFormat, nextTypeface: Typeface) => {
      const previous = scriptRef.current;

      if (!previous) {
        return;
      }

      if (
        previous.pageFormat === nextPageFormat &&
        previous.typeface === nextTypeface
      ) {
        return;
      }

      const nextScript = {
        ...previous,
        pageFormat: nextPageFormat,
        typeface: nextTypeface,
        documentSettings: {
          ...previous.documentSettings,
          pageFormat: nextPageFormat,
          typeface: nextTypeface,
        },
      };
      const nextText = stringifyFountain(nextScript);

      scriptRef.current = nextScript;
      setScript(nextScript);
      setDirty(isDirty(savedTextRef.current, nextText));

      if (!persistence) {
        return;
      }

      persistence.scheduleAutosave({
        id: libraryIdRef.current,
        text: nextText,
        importFileName: importFileNameRef.current,
        onPendingChange: (pending) => {
          setDirty(pending || isDirty(savedTextRef.current, nextText));
        },
        onPersisted: (result) => {
          applyPersistResult(nextText, result);
          void refreshLibrary();
        },
      });
    },
    [applyPersistResult, persistence, refreshLibrary],
  );

  const updatePageFormat = useCallback(
    (nextPageFormat: PageFormat) => {
      const current = scriptRef.current;

      if (!current) {
        return;
      }

      applyExportSettings(nextPageFormat, current.typeface);
    },
    [applyExportSettings],
  );

  const updateTypeface = useCallback(
    (nextTypeface: Typeface) => {
      const current = scriptRef.current;

      if (!current) {
        return;
      }

      applyExportSettings(current.pageFormat, nextTypeface);
    },
    [applyExportSettings],
  );

  const openExportSettingsDialog = useCallback(() => {
    if (!scriptRef.current) {
      return;
    }

    setExportSettingsDialogOpen(true);
  }, []);

  const closeTitlePageDialog = useCallback(() => {
    setTitlePageDialogOpen(false);
    setTitlePageDialogInitialData(null);
  }, []);

  const closeExportSettingsDialog = useCallback(() => {
    setExportSettingsDialogOpen(false);
  }, []);

  const saveExportSettings = useCallback(
    (settings: { pageFormat: PageFormat; typeface: Typeface }) => {
      applyExportSettings(settings.pageFormat, settings.typeface);
      setExportSettingsDialogOpen(false);
    },
    [applyExportSettings],
  );

  const openPreview = useCallback(() => {
    if (!scriptRef.current) {
      return;
    }

    navigate('/script/preview');
  }, [navigate]);

  const exportPdf = useCallback(async () => {
    const current = scriptRef.current;

    if (!current) {
      return;
    }

    const baseName =
      fileNameFromPath(filePath).replace(/\.(fountain|txt)$/i, '') ||
      'Untitled';

    const cleanup = applyPrintPageFormat(current.pageFormat ?? 'us-letter');

    try {
      await api.exportPdf?.({
        pageFormat: current.pageFormat ?? 'us-letter',
        defaultName: `${baseName}.pdf`,
      });
    } finally {
      cleanup();
    }
  }, [api, filePath]);

  const updateTitlePage = useCallback(
    (titlePage: string[]) => {
      const previous = scriptRef.current;

      if (!previous) {
        return;
      }

      const nextScript = {
        ...previous,
        titlePage,
        document: stripTitlePageFromDocument(previous.document, titlePage),
      };
      const nextText = stringifyFountain(nextScript);

      scriptRef.current = nextScript;
      setScript(nextScript);
      setEditorSessionKey((key) => key + 1);
      setDirty(isDirty(savedTextRef.current, nextText));

      if (!persistence) {
        return;
      }

      persistence.scheduleAutosave({
        id: libraryIdRef.current,
        text: nextText,
        importFileName: importFileNameRef.current,
        onPendingChange: (pending) => {
          setDirty(pending || isDirty(savedTextRef.current, nextText));
        },
        onPersisted: (result) => {
          applyPersistResult(nextText, result);
          void refreshLibrary();
        },
      });
    },
    [applyPersistResult, persistence, refreshLibrary],
  );

  const saveTitlePage = useCallback(
    (data: TitlePageData) => {
      updateTitlePage(stringifyTitlePage(data));
      setTitlePageDialogOpen(false);
      setTitlePageDialogInitialData(null);
    },
    [updateTitlePage],
  );

  const persistToPath = useCallback(
    async (path: string): Promise<boolean> => {
      const latestScript = scriptRef.current;

      if (!latestScript) {
        return false;
      }

      const text = stringifyForSave(latestScript);
      const fileName = await api.writeFile(path, text);
      savedTextRef.current = text;
      setFilePath(path);
      setDirty(false);
      await syncWindowTitle(
        sessionDisplayName ?? fileNameFromPath(path),
        false,
      );

      if (fileName) {
        return true;
      }

      return true;
    },
    [api, sessionDisplayName, syncWindowTitle],
  );

  const saveScript = useCallback(async (): Promise<boolean> => {
    if (!scriptRef.current) {
      return false;
    }

    if (persistence) {
      persistence.cancelAutosave();

      return flushLibraryChanges();
    }

    if (!filePath) {
      const path = await api.showSaveDialog('Untitled.fountain');

      if (!path) {
        return false;
      }

      return persistToPath(path);
    }

    return persistToPath(filePath);
  }, [api, filePath, flushLibraryChanges, persistToPath, persistence]);

  const saveScriptAs = useCallback(async (): Promise<boolean> => {
    if (!scriptRef.current) {
      return false;
    }

    const defaultName = `${sessionDisplayName ?? fileNameFromPath(filePath)}.fountain`;
    const path = await api.showSaveDialog(defaultName);

    if (!path) {
      return false;
    }

    return persistToPath(path);
  }, [api, filePath, persistToPath, sessionDisplayName]);

  const clearOpenError = useCallback(() => {
    setOpenError(null);
  }, []);

  const openScriptFromDiskWithoutConfirm = useCallback(async () => {
    setOpenError(null);

    const path = await api.showOpenDialog();

    if (!path) {
      return;
    }

    try {
      const text = await api.readFile(path);

      if (persistence) {
        const importFileName = fileNameFromPath(path);
        const result = await persistence.persistScript({
          id: null,
          text,
          importFileName,
        });

        applySession(
          parseFountain(text),
          text,
          null,
          result.id,
          result.displayName,
          importFileName,
        );
        await refreshLibrary();
        return;
      }

      const session = createSessionFromText(text, path);
      applySession(session.script, session.savedText, session.filePath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not open this file.';

      setOpenError(message);
      navigate('/');
    }
  }, [api, applySession, navigate, persistence, refreshLibrary]);

  const openScriptFromDisk = useCallback(async () => {
    const choice = await confirmUnsavedChanges();

    if (choice === 'cancel') {
      return;
    }

    await openScriptFromDiskWithoutConfirm();
  }, [confirmUnsavedChanges, openScriptFromDiskWithoutConfirm]);

  const openScriptFromLibrary = useCallback(
    async (id: string) => {
      if (!persistence) {
        return;
      }

      const choice = await confirmUnsavedChanges();

      if (choice === 'cancel') {
        return;
      }

      setOpenError(null);

      try {
        const text = await persistence.loadScript(id);

        if (!text) {
          setOpenError('Could not open this script.');
          return;
        }

        const entry = libraryEntries.find((item) => item.id === id);
        await persistence.setLastOpenScriptId(id);
        applySession(
          parseFountain(text),
          text,
          null,
          id,
          entry?.displayName ?? null,
          null,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not open this script.';

        setOpenError(message);
      }
    },
    [applySession, confirmUnsavedChanges, libraryEntries, persistence],
  );

  const deleteLibraryScript = useCallback(
    async (id: string) => {
      if (!persistence) {
        return;
      }

      await persistence.deleteScript(id);
      await refreshLibrary();
    },
    [persistence, refreshLibrary],
  );

  const startNewScript = useCallback(async () => {
    const choice = await confirmUnsavedChanges();

    if (choice === 'cancel') {
      return;
    }

    const text = newScriptStub();
    applySession(parseFountain(text), text, null, null, 'Untitled', null);
  }, [applySession, confirmUnsavedChanges]);

  const loadScriptFromText = useCallback(
    (text: string, path: string | null = null) => {
      const session = createSessionFromText(text, path);
      applySession(session.script, session.savedText, session.filePath);
    },
    [applySession],
  );

  const getSerializedFountainText = useCallback((): string | null => {
    const latest = scriptRef.current;

    if (!latest) {
      return null;
    }

    return stringifyForSave(latest);
  }, []);

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
    if (!persistence || resumeChecked) {
      return;
    }

    void (async () => {
      try {
        const lastId = await persistence.getLastOpenScriptId();

        if (lastId) {
          const text = await persistence.loadScript(lastId);

          if (text) {
            const entries = await persistence.listScripts();
            const entry = entries.find((item) => item.id === lastId);

            setLibraryEntries(entries);
            applySession(
              parseFountain(text),
              text,
              null,
              lastId,
              entry?.displayName ?? null,
              null,
            );
            return;
          }
        }

        const draft = persistence.loadSessionDraft();

        if (draft) {
          applySession(
            parseFountain(draft),
            draft,
            null,
            null,
            'Untitled',
            null,
          );
        }
      } finally {
        setResumeChecked(true);
      }
    })();
  }, [applySession, persistence, resumeChecked]);

  useEffect(() => {
    return () => {
      persistence?.cancelAutosave();
    };
  }, [persistence]);

  useEffect(() => {
    const unsubscribe = api.onFileCommand(async (command) => {
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
        return;
      }

      if (command === 'title-page') {
        openTitlePageDialog();
        return;
      }

      if (command === 'preview') {
        openPreview();
      }
    });

    return unsubscribe;
  }, [
    api,
    confirmUnsavedChanges,
    openScriptFromDisk,
    saveScript,
    saveScriptAs,
    startNewScript,
    openTitlePageDialog,
    openPreview,
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

  const pageFormat = script?.pageFormat ?? 'us-letter';
  const typeface = script?.typeface ?? 'courier-prime';

  const value = useMemo(
    () => ({
      script,
      pageFormat,
      typeface,
      editorSessionKey,
      filePath,
      libraryId,
      fileName,
      dirty,
      libraryEntries,
      startNewScript,
      openScriptFromDisk,
      openScriptFromLibrary,
      deleteLibraryScript,
      refreshLibrary,
      loadScriptFromText,
      updateDocument,
      saveScript,
      saveScriptAs,
      confirmUnsavedChanges,
      getSerializedFountainText,
      openTitlePageDialog,
      closeTitlePageDialog,
      titlePageDialogOpen,
      titlePageDialogInitialData,
      saveTitlePage,
      openExportSettingsDialog,
      closeExportSettingsDialog,
      exportSettingsDialogOpen,
      saveExportSettings,
      updatePageFormat,
      updateTypeface,
      openPreview,
      exportPdf,
      openError,
      clearOpenError,
    }),
    [
      script,
      pageFormat,
      typeface,
      editorSessionKey,
      filePath,
      libraryId,
      fileName,
      dirty,
      libraryEntries,
      startNewScript,
      openScriptFromDisk,
      openScriptFromLibrary,
      deleteLibraryScript,
      refreshLibrary,
      loadScriptFromText,
      updateDocument,
      saveScript,
      saveScriptAs,
      confirmUnsavedChanges,
      getSerializedFountainText,
      openTitlePageDialog,
      closeTitlePageDialog,
      titlePageDialogOpen,
      titlePageDialogInitialData,
      saveTitlePage,
      openExportSettingsDialog,
      closeExportSettingsDialog,
      exportSettingsDialogOpen,
      saveExportSettings,
      updatePageFormat,
      updateTypeface,
      openPreview,
      exportPdf,
      openError,
      clearOpenError,
    ],
  );

  return (
    <ScriptSessionContext.Provider value={value}>
      {children}
      {unsavedPromptOpen ? (
        <ModalDialog
          open
          popupClassName="modal-dialog--unsaved"
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              void resolveUnsavedPrompt('cancel');
            }
          }}
        >
          <ModalDialogTitle className="unsaved-modal-title">
            Save changes?
          </ModalDialogTitle>
          <ModalDialogDescription className="unsaved-modal-body">
            Save changes to this script before continuing?
          </ModalDialogDescription>
          <div className="unsaved-modal-actions">
            <button
              type="button"
              className="ui-button ui-button-primary"
              onClick={() => void resolveUnsavedPrompt('save')}
            >
              Save
            </button>
            <button
              type="button"
              className="ui-button"
              onClick={() => void resolveUnsavedPrompt('discard')}
            >
              Don&apos;t save
            </button>
            <button
              type="button"
              className="ui-button ui-button-ghost"
              onClick={() => void resolveUnsavedPrompt('cancel')}
            >
              Cancel
            </button>
          </div>
        </ModalDialog>
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
