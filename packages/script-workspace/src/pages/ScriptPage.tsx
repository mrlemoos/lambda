import { ScriptEditorSurface } from '@lambda/editor';
import { useEffect } from 'react';

import { EditorZoomSurface, useEditorZoom } from '@lambda/editor-zoom';
import { useScriptSession } from '@lambda/script-session';

import { ScriptToolbar } from '../components/ScriptToolbar.js';

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

  useEffect(() => {
    if (!script) {
      window.location.replace('/');
    }
  }, [script]);

  if (!script) {
    return null;
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
