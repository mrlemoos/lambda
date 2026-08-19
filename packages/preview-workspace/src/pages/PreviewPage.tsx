import { paginateSessionDocument } from '@lambda/editor';
import { ScriptPreviewView } from '@lambda/print';

import { useScriptSession } from '@lambda/script-session';

export function PreviewPage() {
  const { script, pageFormat, typeface, openExportSettingsDialog, exportPdf } =
    useScriptSession();

  if (!script) {
    return null;
  }

  const { blocks, pagination } = paginateSessionDocument({
    document: script.document,
    titlePageLines: script.titlePage,
    pageFormat,
    typeface,
  });

  return (
    <main className="app-shell preview-workspace">
      <header className="preview-toolbar">
        <a
          href="/script"
          className="ui-button ui-button-ghost preview-toolbar-back"
        >
          ← Back
        </a>
        <div className="preview-toolbar-actions">
          <button
            type="button"
            className="ui-button ui-button-ghost"
            onClick={openExportSettingsDialog}
          >
            Export settings…
          </button>
          <button
            type="button"
            className="ui-button ui-button-primary"
            onClick={() => void exportPdf()}
          >
            Export PDF
          </button>
        </div>
      </header>
      <div className="preview-scroll">
        <ScriptPreviewView
          blocks={blocks}
          pagination={pagination}
          pageFormat={pageFormat}
          typeface={typeface}
          titlePageLines={script.titlePage}
        />
      </div>
    </main>
  );
}
