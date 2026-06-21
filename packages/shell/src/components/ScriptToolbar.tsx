import type { MouseEvent } from 'react';

import { Link } from 'react-router-dom';

import { useEditorZoom } from '../session/EditorZoomContext.js';
import type { UnsavedChoice } from '../session/ScriptSessionContext.js';

export type ScriptToolbarProps = {
  fileName: string;
  dirty: boolean;
  onBack: () => Promise<UnsavedChoice>;
  onTitlePage?: () => void;
};

export function ScriptToolbar({
  fileName,
  dirty,
  onBack,
  onTitlePage,
}: ScriptToolbarProps) {
  const { readout } = useEditorZoom();

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
        {onTitlePage ? (
          <button
            type="button"
            className="ui-button ui-button-ghost script-toolbar-title-page"
            onClick={onTitlePage}
          >
            Title Page…
          </button>
        ) : null}
        <span className="script-toolbar-zoom" aria-label="Editor zoom">
          {readout}
        </span>
      </div>
    </header>
  );
}
