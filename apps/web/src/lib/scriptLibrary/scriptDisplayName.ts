import { parseTitlePage } from '@lambda/editor';

const UNTITLED = 'Untitled';

function stripExtension(fileName: string): string {
  return fileName.replace(/\.(fountain|txt)$/i, '');
}

export function resolveScriptDisplayName(
  text: string,
  importFileName?: string | null,
): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const titlePage = parseTitlePage(lines);
  const titleText = titlePage.title.join(' ').trim();

  if (titleText) {
    return titleText;
  }

  if (importFileName) {
    return stripExtension(importFileName);
  }

  return UNTITLED;
}

export function isUntitledDisplayName(displayName: string): boolean {
  const normalised = displayName.trim();

  if (!normalised) {
    return true;
  }

  return normalised.toLowerCase() === UNTITLED.toLowerCase();
}

export function shouldPersistToLibrary(
  text: string,
  importFileName?: string | null,
): boolean {
  return !isUntitledDisplayName(resolveScriptDisplayName(text, importFileName));
}
