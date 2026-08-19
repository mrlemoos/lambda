import { LiquidMetalButton } from '@lambda/design-system';
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

  const handleBack = async () => {
    const choice = await onBack();

    if (choice === 'cancel') {
      return;
    }

    window.location.assign('/');
  };

  return (
    <header className="script-toolbar">
      <LiquidMetalButton
        className="script-toolbar-back"
        onClick={() => void handleBack()}
      >
        ← Welcome
      </LiquidMetalButton>
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
          <LiquidMetalButton
            className="script-toolbar-title-page"
            onClick={onTitlePage}
          >
            Title Page…
          </LiquidMetalButton>
        ) : null}
        {onPreview ? (
          <LiquidMetalButton
            className="script-toolbar-preview"
            onClick={onPreview}
          >
            Preview…
          </LiquidMetalButton>
        ) : null}
        <span className="script-toolbar-zoom" aria-label="Editor zoom">
          {readout}
        </span>
      </div>
    </header>
  );
}
