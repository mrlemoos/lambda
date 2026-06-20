import type { Editor } from '@tiptap/core';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type ScriptEditorCommands = {
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
};

const ScriptEditorCommandsContext = createContext<ScriptEditorCommands | null>(
  null,
);

let activeScriptEditorCommands: ScriptEditorCommands | null = null;
const activeScriptEditorCommandListeners = new Set<() => void>();

function subscribeToActiveScriptEditorCommands(
  listener: () => void,
): () => void {
  activeScriptEditorCommandListeners.add(listener);

  return () => {
    activeScriptEditorCommandListeners.delete(listener);
  };
}

function setActiveScriptEditorCommands(
  commands: ScriptEditorCommands | null,
): void {
  activeScriptEditorCommands = commands;

  for (const listener of activeScriptEditorCommandListeners) {
    listener();
  }
}

export function ScriptEditorCommandsProvider({
  editor,
  children,
}: {
  editor: Editor;
  children: ReactNode;
}) {
  const commands = useMemo(
    (): ScriptEditorCommands => ({
      undo: () => {
        editor.chain().focus().undo().run();
      },
      redo: () => {
        editor.chain().focus().redo().run();
      },
      cut: () => {
        document.execCommand('cut');
      },
      copy: () => {
        document.execCommand('copy');
      },
      paste: () => {
        document.execCommand('paste');
      },
      selectAll: () => {
        editor.chain().focus().selectAll().run();
      },
    }),
    [editor],
  );

  useEffect(() => {
    setActiveScriptEditorCommands(commands);

    return () => {
      if (activeScriptEditorCommands === commands) {
        setActiveScriptEditorCommands(null);
      }
    };
  }, [commands]);

  return (
    <ScriptEditorCommandsContext.Provider value={commands}>
      {children}
    </ScriptEditorCommandsContext.Provider>
  );
}

export function useScriptEditorCommands(): ScriptEditorCommands | null {
  const contextCommands = useContext(ScriptEditorCommandsContext);
  const registryCommands = useSyncExternalStore(
    subscribeToActiveScriptEditorCommands,
    () => activeScriptEditorCommands,
    () => null,
  );

  return contextCommands ?? registryCommands;
}
