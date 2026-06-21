import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';

import { useScriptPagination } from '../pagination/useScriptPagination';
import { ScriptEditor, type PageFormat } from '../ScriptEditor';

const EMPTY_TITLE_PAGE_LINES: string[] = [];

export type ScriptEditorContentProps = {
  editor: Editor;
  pageFormat?: PageFormat;
  titlePageLines?: string[];
};

export function ScriptEditorContent({
  editor,
  pageFormat = 'us-letter',
  titlePageLines = EMPTY_TITLE_PAGE_LINES,
}: ScriptEditorContentProps) {
  const pagination = useScriptPagination(editor, pageFormat, titlePageLines);

  return (
    <ScriptEditor pageFormat={pageFormat} pagination={pagination}>
      <EditorContent editor={editor} />
    </ScriptEditor>
  );
}
