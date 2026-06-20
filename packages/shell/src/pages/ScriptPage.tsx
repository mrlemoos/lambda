import { ScriptEditorSurface } from '@lambda/editor';
import { Navigate } from 'react-router-dom';

import { EditorZoomSurface } from '../components/EditorZoomSurface.js';
import { ScriptToolbar } from '../components/ScriptToolbar.js';
import { useEditorZoom } from '../session/EditorZoomContext.js';
import { useScriptSession } from '../session/ScriptSessionContext.js';

export function ScriptPage() {
  const {
    script,
    filePath,
    libraryId,
    fileName,
    dirty,
    updateDocument,
    confirmUnsavedChanges,
  } = useScriptSession();
  const { level } = useEditorZoom();

  if (!script) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="app-shell script-workspace">
      <ScriptToolbar
        fileName={fileName}
        dirty={dirty}
        onBack={confirmUnsavedChanges}
      />
      <EditorZoomSurface level={level}>
        <ScriptEditorSurface
          key={libraryId ?? filePath ?? 'untitled'}
          initialDocument={script.document}
          onDocumentChange={updateDocument}
        />
      </EditorZoomSurface>
    </main>
  );
}
