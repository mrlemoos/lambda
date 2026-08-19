import { useEffect, useMemo, useState } from 'react';

import {
  formatLibraryEntryLabel,
  useScriptSession,
} from '@lambda/script-session';

export type WelcomeWritingAccess = 'write' | 'sign-in-wall' | 'offline-blocked';

export type WelcomePageProps = {
  writingAccess?: WelcomeWritingAccess;
  hasSession?: boolean;
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  onOpenAccount?: () => void;
};

export function WelcomePage({
  writingAccess = 'write',
  hasSession = false,
  onSignIn,
  onCreateAccount,
  onOpenAccount,
}: WelcomePageProps) {
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
  const canWrite = writingAccess === 'write';

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
          {welcomeTagline(writingAccess)}
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
        {canWrite ? (
          <>
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
            {hasSession ? (
              <button
                type="button"
                className="ui-button"
                onClick={() => onOpenAccount?.()}
              >
                Account
              </button>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              className="ui-button ui-button-primary"
              onClick={() => onSignIn?.()}
            >
              Sign in
            </button>
            <button
              type="button"
              className="ui-button"
              onClick={() => onCreateAccount?.()}
            >
              Create account
            </button>
          </>
        )}
      </div>
      {canWrite && libraryItems.length > 0 ? (
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

function welcomeTagline(writingAccess: WelcomeWritingAccess): string {
  if (writingAccess === 'offline-blocked') {
    return 'You are offline. Sign in when you are back online to keep writing.';
  }

  if (writingAccess === 'sign-in-wall') {
    return 'Sign in with your Account to write. Your Account is shared on Lambda Web and desktop.';
  }

  return 'Write in Fountain. Your Account is shared on Lambda Web and desktop.';
}
