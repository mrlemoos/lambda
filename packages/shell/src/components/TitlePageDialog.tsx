import type { TitlePageData } from '@lambda/editor';

import { ModalDialog, ModalDialogTitle } from './ModalDialog.js';

export type TitlePageDialogProps = {
  open: boolean;
  initialData: TitlePageData;
  onSave: (data: TitlePageData) => void;
  onCancel: () => void;
};

function linesFromTextarea(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function textareaFromLines(lines: string[] | undefined): string {
  return (lines ?? []).join('\n');
}

function buildTitlePageData(form: {
  title: string;
  credit: string;
  author: string;
  source: string;
  draftDate: string;
  contact: string;
  copyright: string;
  notes: string;
}): TitlePageData {
  const data: TitlePageData = {
    title: linesFromTextarea(form.title),
  };

  const credit = form.credit.trim();
  const source = form.source.trim();
  const draftDate = form.draftDate.trim();
  const copyright = form.copyright.trim();
  const notes = form.notes.trim();
  const author = linesFromTextarea(form.author);
  const contact = linesFromTextarea(form.contact);

  if (credit) {
    data.credit = credit;
  }

  if (author.length > 0) {
    data.author = author;
  }

  if (source) {
    data.source = source;
  }

  if (draftDate) {
    data.draftDate = draftDate;
  }

  if (contact.length > 0) {
    data.contact = contact;
  }

  if (copyright) {
    data.copyright = copyright;
  }

  if (notes) {
    data.notes = notes;
  }

  return data;
}

type TitlePageDialogFormProps = {
  initialData: TitlePageData;
  onSave: (data: TitlePageData) => void;
  onCancel: () => void;
};

function titlePageFormKey(data: TitlePageData): string {
  return JSON.stringify(data);
}

function readFormField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === 'string' ? value : '';
}

function TitlePageDialogForm({
  initialData,
  onSave,
  onCancel,
}: TitlePageDialogFormProps) {
  return (
    <>
      <ModalDialogTitle className="title-page-modal-title">
        Title Page
      </ModalDialogTitle>
      <form
        key={titlePageFormKey(initialData)}
        className="title-page-form"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          onSave(
            buildTitlePageData({
              title: readFormField(formData, 'title'),
              credit: readFormField(formData, 'credit'),
              author: readFormField(formData, 'author'),
              source: readFormField(formData, 'source'),
              draftDate: readFormField(formData, 'draftDate'),
              contact: readFormField(formData, 'contact'),
              copyright: readFormField(formData, 'copyright'),
              notes: readFormField(formData, 'notes'),
            }),
          );
        }}
      >
        <label className="title-page-field">
          <span>Title</span>
          <textarea
            name="title"
            aria-label="Title"
            defaultValue={textareaFromLines(initialData.title)}
            rows={3}
          />
        </label>
        <label className="title-page-field">
          <span>Credit</span>
          <input
            name="credit"
            aria-label="Credit"
            defaultValue={initialData.credit ?? ''}
          />
        </label>
        <label className="title-page-field">
          <span>Author</span>
          <textarea
            name="author"
            aria-label="Author"
            defaultValue={textareaFromLines(initialData.author)}
            rows={2}
          />
        </label>
        <label className="title-page-field">
          <span>Source</span>
          <input
            name="source"
            aria-label="Source"
            defaultValue={initialData.source ?? ''}
          />
        </label>
        <label className="title-page-field">
          <span>Draft date</span>
          <input
            name="draftDate"
            aria-label="Draft date"
            defaultValue={initialData.draftDate ?? ''}
          />
        </label>
        <label className="title-page-field">
          <span>Contact</span>
          <textarea
            name="contact"
            aria-label="Contact"
            defaultValue={textareaFromLines(initialData.contact)}
            rows={3}
          />
        </label>
        <label className="title-page-field">
          <span>Copyright</span>
          <input
            name="copyright"
            aria-label="Copyright"
            defaultValue={initialData.copyright ?? ''}
          />
        </label>
        <label className="title-page-field">
          <span>Notes</span>
          <textarea
            name="notes"
            aria-label="Notes"
            defaultValue={initialData.notes ?? ''}
            rows={2}
          />
        </label>
        <div className="title-page-modal-actions">
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

export function TitlePageDialog({
  open,
  initialData,
  onSave,
  onCancel,
}: TitlePageDialogProps) {
  return (
    <ModalDialog
      open={open}
      popupClassName="modal-dialog--title-page"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
    >
      {open ? (
        <TitlePageDialogForm
          initialData={initialData}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : null}
    </ModalDialog>
  );
}
