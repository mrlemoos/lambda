import { TitlePageDialog } from './TitlePageDialog.js';
import { ExportSettingsDialog } from './ExportSettingsDialog.js';
import { useScriptSession } from '@lambda/script-session';

export function ScriptWorkspaceDialogs() {
  const {
    script,
    pageFormat,
    typeface,
    titlePageDialogOpen,
    titlePageDialogInitialData,
    saveTitlePage,
    closeTitlePageDialog,
    exportSettingsDialogOpen,
    saveExportSettings,
    closeExportSettingsDialog,
  } = useScriptSession();

  return (
    <>
      {titlePageDialogOpen && script && titlePageDialogInitialData ? (
        <TitlePageDialog
          open
          initialData={titlePageDialogInitialData}
          onSave={saveTitlePage}
          onCancel={closeTitlePageDialog}
        />
      ) : null}
      {exportSettingsDialogOpen && script ? (
        <ExportSettingsDialog
          open
          pageFormat={pageFormat}
          typeface={typeface}
          onSave={saveExportSettings}
          onCancel={closeExportSettingsDialog}
        />
      ) : null}
    </>
  );
}
