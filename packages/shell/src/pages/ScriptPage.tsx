import type { MouseEvent } from 'react';

import { ScriptEditorSurface } from '@lambda/editor';
import { Link } from 'react-router-dom';

import { useScriptSession } from '../session/ScriptSessionContext.js';

export function ScriptPage() {
  const { script, filePath, updateDocument, confirmUnsavedChanges } =
    useScriptSession();

  if (!script) {
    return (
      <main className="app-shell script-empty">
        <p>No script is open.</p>
        <Link to="/">Back to welcome</Link>
      </main>
    );
  }

  const handleBack = async (event: MouseEvent<HTMLAnchorElement>) => {
    const choice = await confirmUnsavedChanges();

    if (choice === 'cancel') {
      event.preventDefault();
    }
  };

  return (
    <main className="app-shell script-workspace">
      <header className="script-toolbar">
        <Link to="/" onClick={(event) => void handleBack(event)}>
          ← Welcome
        </Link>
      </header>
      <ScriptEditorSurface
        key={filePath ?? 'untitled'}
        initialDocument={script.document}
        onDocumentChange={updateDocument}
      />
    </main>
  );
}
