import { useScriptSession } from '../session/ScriptSessionContext.js';
import { formatPlatformShortcut } from '../lib/platformShortcuts.js';

export function WelcomePage() {
  const { startNewScript, openScriptFromDisk, openError, clearOpenError } =
    useScriptSession();

  const shortcuts = [
    { accelerator: 'CmdOrCtrl+N', label: 'new' },
    { accelerator: 'CmdOrCtrl+O', label: 'open' },
    { accelerator: 'CmdOrCtrl+S', label: 'save' },
  ] as const;

  const shortcutHint = shortcuts
    .map(
      ({ accelerator, label }) =>
        `${formatPlatformShortcut(accelerator)} ${label}`,
    )
    .join(' · ');

  return (
    <main className="app-shell welcome">
      <div className="welcome-hero">
        <p className="ui-kicker">Offline screenwriting</p>
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
      <p className="ui-hint welcome-shortcuts">{shortcutHint}</p>
    </main>
  );
}
