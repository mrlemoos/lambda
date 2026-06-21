import type { TitlePageData } from './parseTitlePage';

const INDENT = '    ';

function pushInlineField(lines: string[], key: string, value: string): void {
  lines.push(`${key}: ${value}`);
}

function pushMultilineField(
  lines: string[],
  key: string,
  values: string[] | undefined,
): void {
  const entries = (values ?? []).map((value) => value.trim()).filter(Boolean);

  if (entries.length === 0) {
    lines.push(`${key}:`);
    return;
  }

  if (entries.length === 1 && !entries[0].includes('\n')) {
    pushInlineField(lines, key, entries[0]);
    return;
  }

  lines.push(`${key}:`);

  for (const entry of entries) {
    for (const line of entry.split('\n')) {
      const trimmed = line.trim();

      if (trimmed) {
        lines.push(`${INDENT}${trimmed}`);
      }
    }
  }
}

export function stringifyTitlePage(data: TitlePageData): string[] {
  const lines: string[] = [];

  pushMultilineField(lines, 'Title', data.title);

  if (data.credit?.trim()) {
    pushInlineField(lines, 'Credit', data.credit.trim());
  }

  if (data.author !== undefined) {
    pushMultilineField(lines, 'Author', data.author);
  }

  if (data.source?.trim()) {
    pushInlineField(lines, 'Source', data.source.trim());
  }

  if (data.draftDate?.trim()) {
    pushInlineField(lines, 'Draft date', data.draftDate.trim());
  }

  if (data.contact !== undefined) {
    pushMultilineField(lines, 'Contact', data.contact);
  }

  if (data.copyright?.trim()) {
    pushInlineField(lines, 'Copyright', data.copyright.trim());
  }

  if (data.notes?.trim()) {
    pushInlineField(lines, 'Notes', data.notes.trim());
  }

  return lines;
}
