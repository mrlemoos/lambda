import type { TitlePageData } from '@lambda/editor';
import { useState } from 'react';

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

function TitlePageDialogForm({
  initialData,
  onSave,
  onCancel,
}: TitlePageDialogFormProps) {
  const [title, setTitle] = useState(() =>
    textareaFromLines(initialData.title),
  );
  const [credit, setCredit] = useState(() => initialData.credit ?? '');
  const [author, setAuthor] = useState(() =>
    textareaFromLines(initialData.author),
  );
  const [source, setSource] = useState(() => initialData.source ?? '');
  const [draftDate, setDraftDate] = useState(() => initialData.draftDate ?? '');
  const [contact, setContact] = useState(() =>
    textareaFromLines(initialData.contact),
  );
  const [copyright, setCopyright] = useState(() => initialData.copyright ?? '');
  const [notes, setNotes] = useState(() => initialData.notes ?? '');

  return (
    <div className="title-page-modal-backdrop" role="presentation">
      <dialog
        className="title-page-modal"
        open
        aria-modal="true"
        aria-labelledby="title-page-modal-title"
      >
        <h2 id="title-page-modal-title" className="title-page-modal-title">
          Title Page
        </h2>
        <form
          className="title-page-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(
              buildTitlePageData({
                title,
                credit,
                author,
                source,
                draftDate,
                contact,
                copyright,
                notes,
              }),
            );
          }}
        >
          <label className="title-page-field">
            <span>Title</span>
            <textarea
              aria-label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              rows={3}
            />
          </label>
          <label className="title-page-field">
            <span>Credit</span>
            <input
              aria-label="Credit"
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
            />
          </label>
          <label className="title-page-field">
            <span>Author</span>
            <textarea
              aria-label="Author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              rows={2}
            />
          </label>
          <label className="title-page-field">
            <span>Source</span>
            <input
              aria-label="Source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </label>
          <label className="title-page-field">
            <span>Draft date</span>
            <input
              aria-label="Draft date"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
          </label>
          <label className="title-page-field">
            <span>Contact</span>
            <textarea
              aria-label="Contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              rows={3}
            />
          </label>
          <label className="title-page-field">
            <span>Copyright</span>
            <input
              aria-label="Copyright"
              value={copyright}
              onChange={(event) => setCopyright(event.target.value)}
            />
          </label>
          <label className="title-page-field">
            <span>Notes</span>
            <textarea
              aria-label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
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
      </dialog>
    </div>
  );
}

export function TitlePageDialog({
  open,
  initialData,
  onSave,
  onCancel,
}: TitlePageDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <TitlePageDialogForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
