import { ScriptEditorSurface } from '@lambda/editor';
import { Navigate } from 'react-router-dom';

import { ScriptToolbar } from '../components/ScriptToolbar.js';
import { useScriptSession } from '../session/ScriptSessionContext.js';

export function ScriptPage() {
  const {
    script,
    filePath,
    fileName,
    dirty,
    updateDocument,
    confirmUnsavedChanges,
  } = useScriptSession();

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
      <ScriptEditorSurface
        key={filePath ?? 'untitled'}
        initialDocument={script.document}
        onDocumentChange={updateDocument}
      />
    </main>
  );
}
