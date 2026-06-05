import { EditorContent } from '@tiptap/react';

import { ScriptEditor, type PageFormat } from '../ScriptEditor';
import { useScriptEditor } from './useScriptEditor';

export type ScriptEditorSurfaceProps = {
  pageFormat?: PageFormat;
};

export function ScriptEditorSurface({
  pageFormat = 'us-letter',
}: ScriptEditorSurfaceProps) {
  const editor = useScriptEditor();

  if (!editor) {
    return null;
  }

  return (
    <ScriptEditor pageFormat={pageFormat}>
      <EditorContent editor={editor} />
    </ScriptEditor>
  );
}
