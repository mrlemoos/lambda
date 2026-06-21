import type { JSONContent } from '@tiptap/core';
import { useEffect, useState } from 'react';

import type { PageFormat, ScriptTypeface } from '../ScriptEditor';
import { ScriptEditorContent } from './ScriptEditorContent';
import { ScriptEditorCommandsProvider } from './scriptEditorCommands.js';
import { useScriptEditor } from './useScriptEditor';

const EMPTY_TITLE_PAGE_LINES: string[] = [];

export type ScriptEditorSurfaceProps = {
  pageFormat?: PageFormat;
  typeface?: ScriptTypeface;
  initialDocument?: JSONContent;
  titlePageLines?: string[];
  onDocumentChange?: (document: JSONContent) => void;
};

export function ScriptEditorSurface({
  pageFormat = 'us-letter',
  typeface = 'courier-prime',
  initialDocument,
  titlePageLines = EMPTY_TITLE_PAGE_LINES,
  onDocumentChange,
}: ScriptEditorSurfaceProps) {
  const editor = useScriptEditor(initialDocument);
  const [paginationTitlePageLines, setPaginationTitlePageLines] =
    useState(titlePageLines);

  useEffect(() => {
    setPaginationTitlePageLines(titlePageLines);
  }, [titlePageLines]);

  useEffect(() => {
    if (!editor || !onDocumentChange) {
      return;
    }

    const handleUpdate = ({
      transaction,
    }: {
      transaction: { docChanged: boolean };
    }) => {
      if (!transaction.docChanged) {
        return;
      }

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
      <ScriptEditorContent
        editor={editor}
        pageFormat={pageFormat}
        typeface={typeface}
        titlePageLines={paginationTitlePageLines}
      />
    </ScriptEditorCommandsProvider>
  );
}
