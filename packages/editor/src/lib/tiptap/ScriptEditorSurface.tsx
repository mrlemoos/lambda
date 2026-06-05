import type { PageFormat } from '../ScriptEditor';
import { ScriptEditorContent } from './ScriptEditorContent';
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

  return <ScriptEditorContent editor={editor} pageFormat={pageFormat} />;
}
