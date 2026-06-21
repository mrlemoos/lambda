import { ScriptEditorSurface } from '@lambda/editor';
import { Navigate } from 'react-router-dom';

import { EditorZoomSurface } from '../components/EditorZoomSurface.js';
import { ScriptToolbar } from '../components/ScriptToolbar.js';
import { useEditorZoom } from '../session/EditorZoomContext.js';
import { useScriptSession } from '../session/ScriptSessionContext.js';

export function ScriptPage() {
  const {
    script,
    editorSessionKey,
    pageFormat,
    typeface,
    fileName,
    dirty,
    updateDocument,
    confirmUnsavedChanges,
    openTitlePageDialog,
    openPreview,
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
        onTitlePage={openTitlePageDialog}
        onPreview={openPreview}
      />
      <EditorZoomSurface level={level}>
        <ScriptEditorSurface
          key={editorSessionKey}
          initialDocument={script.document}
          titlePageLines={script.titlePage}
          pageFormat={pageFormat}
          typeface={typeface}
          onDocumentChange={updateDocument}
        />
      </EditorZoomSurface>
    </main>
  );
}
