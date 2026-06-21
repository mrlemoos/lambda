import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';

import { useScriptPagination } from '../pagination/useScriptPagination';
import {
  ScriptEditor,
  type PageFormat,
  type ScriptTypeface,
} from '../ScriptEditor';

const EMPTY_TITLE_PAGE_LINES: string[] = [];

export type ScriptEditorContentProps = {
  editor: Editor;
  pageFormat?: PageFormat;
  typeface?: ScriptTypeface;
  titlePageLines?: string[];
};

export function ScriptEditorContent({
  editor,
  pageFormat = 'us-letter',
  typeface = 'courier-prime',
  titlePageLines = EMPTY_TITLE_PAGE_LINES,
}: ScriptEditorContentProps) {
  const pagination = useScriptPagination(
    editor,
    pageFormat,
    typeface,
    titlePageLines,
  );

  return (
    <ScriptEditor
      pageFormat={pageFormat}
      typeface={typeface}
      pagination={pagination}
    >
      <EditorContent editor={editor} />
    </ScriptEditor>
  );
}
