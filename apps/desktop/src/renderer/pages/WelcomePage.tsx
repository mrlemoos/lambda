import { useScriptSession } from '../session/ScriptSessionContext.js';

export function WelcomePage() {
  const { startNewScript, openScriptFromDisk, openError, clearOpenError } =
    useScriptSession();

  return (
    <main className="app-shell welcome">
      <h1>Lambda</h1>
      <p>Offline Fountain screenwriting</p>
      {openError ? (
        <p className="welcome-error" role="alert">
          {openError}{' '}
          <button type="button" onClick={clearOpenError}>
            Dismiss
          </button>
        </p>
      ) : null}
      <div className="welcome-actions">
        <button type="button" onClick={() => void startNewScript()}>
          New script
        </button>
        <button type="button" onClick={() => void openScriptFromDisk()}>
          Open…
        </button>
      </div>
    </main>
  );
}
