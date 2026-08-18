import type { PageFormat, Typeface } from '@lambda/fountain';

import { ModalDialog, ModalDialogTitle } from '@lambda/design-system';

export type ExportSettingsDialogProps = {
  open: boolean;
  pageFormat: PageFormat;
  typeface: Typeface;
  onSave: (settings: { pageFormat: PageFormat; typeface: Typeface }) => void;
  onCancel: () => void;
};

type ExportSettingsFormProps = {
  pageFormat: PageFormat;
  typeface: Typeface;
  onSave: ExportSettingsDialogProps['onSave'];
  onCancel: ExportSettingsDialogProps['onCancel'];
};

function ExportSettingsForm({
  pageFormat,
  typeface,
  onSave,
  onCancel,
}: ExportSettingsFormProps) {
  return (
    <>
      <ModalDialogTitle className="export-settings-modal-title">
        Export settings
      </ModalDialogTitle>
      <form
        className="export-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const nextPageFormat = formData.get('pageFormat');
          const nextTypeface = formData.get('typeface');

          if (
            typeof nextPageFormat !== 'string' ||
            typeof nextTypeface !== 'string'
          ) {
            return;
          }

          onSave({
            pageFormat: nextPageFormat as PageFormat,
            typeface: nextTypeface as Typeface,
          });
        }}
      >
        <label className="export-settings-field">
          <span>Page format</span>
          <select
            name="pageFormat"
            aria-label="Page format"
            defaultValue={pageFormat}
          >
            <option value="us-letter">US Letter</option>
            <option value="a4">A4</option>
          </select>
        </label>
        <label className="export-settings-field">
          <span>Typeface</span>
          <select name="typeface" aria-label="Typeface" defaultValue={typeface}>
            <option value="courier-prime">Courier Prime</option>
            <option value="courier-new">Courier New</option>
            <option value="monospace">Monospace</option>
          </select>
        </label>
        <div className="export-settings-modal-actions">
          <button type="submit" className="ui-button ui-button-primary">
            Save
          </button>
          <button
            type="button"
            className="ui-button ui-button-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

export function ExportSettingsDialog({
  open,
  pageFormat,
  typeface,
  onSave,
  onCancel,
}: ExportSettingsDialogProps) {
  return (
    <ModalDialog
      open={open}
      popupClassName="modal-dialog--export-settings"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
    >
      {open ? (
        <ExportSettingsForm
          pageFormat={pageFormat}
          typeface={typeface}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : null}
    </ModalDialog>
  );
}
