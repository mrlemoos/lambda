import { useEffect, useMemo, useState } from 'react';

import { formatLibraryEntryLabel } from '../lib/formatLibraryEntryLabel.js';
import { useScriptSession } from '../session/ScriptSessionContext.js';

export function WelcomePage() {
  const {
    startNewScript,
    openScriptFromDisk,
    openScriptFromLibrary,
    deleteLibraryScript,
    libraryEntries,
    refreshLibrary,
    openError,
    clearOpenError,
  } = useScriptSession();
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    void refreshLibrary();
  }, [refreshLibrary]);

  const libraryItems = useMemo(
    () =>
      libraryEntries.map((entry) => ({
        ...entry,
        label: formatLibraryEntryLabel(
          entry.displayName,
          entry.updatedAtMs,
          nowMs,
        ),
      })),
    [libraryEntries, nowMs],
  );

  return (
    <main className="app-shell welcome">
      <div className="welcome-hero">
        <img
          src="/icons/favicon.svg"
          alt=""
          className="welcome-logo"
          width={64}
          height={64}
          aria-hidden
        />
        <h1 className="ui-heading">Lambda</h1>
        <p className="ui-body welcome-tagline">
          Write in Fountain. Save locally. Nothing leaves your machine.
        </p>
      </div>
      {openError ? (
        <p className="ui-alert ui-alert-error" role="alert">
          {openError}{' '}
          <button
            type="button"
            className="ui-button ui-button-ghost welcome-error-dismiss"
            onClick={clearOpenError}
          >
            Dismiss
          </button>
        </p>
      ) : null}
      <div className="welcome-actions">
        <button
          type="button"
          className="ui-button ui-button-primary"
          onClick={() => void startNewScript()}
        >
          New script
        </button>
        <button
          type="button"
          className="ui-button"
          onClick={() => void openScriptFromDisk()}
        >
          Open…
        </button>
      </div>
      {libraryItems.length > 0 ? (
        <section className="welcome-library" aria-label="Local script library">
          <h2 className="ui-kicker welcome-library-heading">Your scripts</h2>
          <ul className="welcome-library-list">
            {libraryItems.map((entry) => (
              <li key={entry.id} className="welcome-library-item">
                <button
                  type="button"
                  className="welcome-library-open"
                  onClick={() => void openScriptFromLibrary(entry.id)}
                >
                  {entry.label}
                </button>
                <button
                  type="button"
                  className="ui-button ui-button-ghost welcome-library-delete"
                  aria-label={`Delete ${entry.displayName}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete “${entry.displayName}” from your local library?`,
                      )
                    ) {
                      void deleteLibraryScript(entry.id);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
