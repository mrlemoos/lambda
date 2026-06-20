import { useScriptSession } from '@lambda/shell';

export function DocumentStatus() {
  const { script, fileName, dirty } = useScriptSession();

  if (!script) {
    return null;
  }

  return (
    <div className="document-status" aria-live="polite">
      <span className="document-status-name">{fileName}</span>
      {dirty ? (
        <span className="ui-badge ui-badge-dirty document-status-dirty">
          Edited
        </span>
      ) : null}
    </div>
  );
}
