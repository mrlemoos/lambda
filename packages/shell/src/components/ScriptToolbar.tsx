import type { MouseEvent } from 'react';

import { Link } from 'react-router-dom';

import type { UnsavedChoice } from '../session/ScriptSessionContext.js';

export type ScriptToolbarProps = {
  fileName: string;
  dirty: boolean;
  onBack: () => Promise<UnsavedChoice>;
};

export function ScriptToolbar({ fileName, dirty, onBack }: ScriptToolbarProps) {
  const handleBack = async (event: MouseEvent<HTMLAnchorElement>) => {
    const choice = await onBack();

    if (choice === 'cancel') {
      event.preventDefault();
    }
  };

  return (
    <header className="script-toolbar">
      <Link
        to="/"
        className="ui-button ui-button-ghost script-toolbar-back"
        onClick={(event) => void handleBack(event)}
      >
        ← Welcome
      </Link>
      <div className="script-toolbar-doc">
        <span className="script-toolbar-filename">{fileName}</span>
        {dirty ? (
          <span
            className="ui-badge ui-badge-dirty"
            aria-label="Unsaved changes"
          >
            Edited
          </span>
        ) : null}
      </div>
    </header>
  );
}
