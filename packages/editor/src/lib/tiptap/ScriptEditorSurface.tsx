import type { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';

import type { PageFormat } from '../ScriptEditor';
import { ScriptEditorContent } from './ScriptEditorContent';
import { ScriptEditorCommandsProvider } from './scriptEditorCommands.js';
import { useScriptEditor } from './useScriptEditor';

export type ScriptEditorSurfaceProps = {
  pageFormat?: PageFormat;
  initialDocument?: JSONContent;
  onDocumentChange?: (document: JSONContent) => void;
};

export function ScriptEditorSurface({
  pageFormat = 'us-letter',
  initialDocument,
  onDocumentChange,
}: ScriptEditorSurfaceProps) {
  const editor = useScriptEditor(initialDocument);

  useEffect(() => {
    if (!editor || !onDocumentChange) {
      return;
    }

    const handleUpdate = () => {
      onDocumentChange(editor.getJSON());
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, onDocumentChange]);

  if (!editor) {
    return null;
  }

  return (
    <ScriptEditorCommandsProvider editor={editor}>
      <ScriptEditorContent editor={editor} pageFormat={pageFormat} />
    </ScriptEditorCommandsProvider>
  );
}
