import type { MouseEvent } from 'react';

import { useEditorZoom } from '@lambda/editor-zoom';
import type { UnsavedChoice } from '@lambda/script-session';

export type ScriptToolbarProps = {
  fileName: string;
  dirty: boolean;
  onBack: () => Promise<UnsavedChoice>;
  onTitlePage?: () => void;
  onPreview?: () => void;
};

export function ScriptToolbar({
  fileName,
  dirty,
  onBack,
  onTitlePage,
  onPreview,
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
      <a
        href="/"
        className="ui-button ui-button-ghost script-toolbar-back"
        onClick={(event) => void handleBack(event)}
      >
        ← Welcome
      </a>
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
        {onPreview ? (
          <button
            type="button"
            className="ui-button ui-button-ghost script-toolbar-preview"
            onClick={onPreview}
          >
            Preview…
          </button>
        ) : null}
        <span className="script-toolbar-zoom" aria-label="Editor zoom">
          {readout}
        </span>
      </div>
    </header>
  );
}
