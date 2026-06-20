import type { Editor } from '@tiptap/core';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

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

  return (
    <ScriptEditorCommandsContext.Provider value={commands}>
      {children}
    </ScriptEditorCommandsContext.Provider>
  );
}

export function useScriptEditorCommands(): ScriptEditorCommands | null {
  return useContext(ScriptEditorCommandsContext);
}
