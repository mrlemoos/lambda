import type { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';

import { useScriptPagination } from '../pagination/useScriptPagination';
import { ScriptEditor, type PageFormat } from '../ScriptEditor';

export type ScriptEditorContentProps = {
  editor: Editor;
  pageFormat?: PageFormat;
};

export function ScriptEditorContent({
  editor,
  pageFormat = 'us-letter',
}: ScriptEditorContentProps) {
  const pagination = useScriptPagination(editor, pageFormat);

  return (
    <ScriptEditor pageFormat={pageFormat} pagination={pagination}>
      <EditorContent editor={editor} />
    </ScriptEditor>
  );
}
