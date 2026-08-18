import {
  parseTitlePage,
  parseTitlePageBlock,
  type TitlePageData,
} from '@lambda/editor';
import { stringifyFountain, type FountainScript } from '@lambda/fountain';

function stripFountainExtension(name: string): string {
  return name.replace(/\.(fountain|txt)$/i, '');
}

function fileNameFromPath(filePath: string | null): string {
  return filePath?.split(/[/\\]/).pop() ?? '';
}

function fallbackDisplayName(
  displayName: string | null,
  filePath: string | null,
): string {
  const trimmedDisplayName = displayName?.trim();

  if (trimmedDisplayName) {
    return stripFountainExtension(trimmedDisplayName);
  }

  return stripFountainExtension(fileNameFromPath(filePath));
}

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function mergeTitlePageData(
  target: TitlePageData,
  source: TitlePageData,
): TitlePageData {
  return {
    title: target.title.length > 0 ? target.title : source.title,
    credit: target.credit ?? source.credit,
    author:
      target.author && target.author.length > 0 ? target.author : source.author,
    source: target.source ?? source.source,
    draftDate: target.draftDate ?? source.draftDate,
    contact:
      target.contact && target.contact.length > 0
        ? target.contact
        : source.contact,
    copyright: target.copyright ?? source.copyright,
    notes: target.notes ?? source.notes,
  };
}

export function resolveTitlePageDialogInitialData(input: {
  savedText: string;
  script: FountainScript;
  displayName: string | null;
  filePath: string | null;
}): TitlePageData {
  let merged: TitlePageData = { title: [] };

  if (input.script.titlePage.length > 0) {
    merged = mergeTitlePageData(
      merged,
      parseTitlePageBlock(input.script.titlePage),
    );
  }

  merged = mergeTitlePageData(
    merged,
    parseTitlePage(splitLines(input.savedText)),
  );
  merged = mergeTitlePageData(
    merged,
    parseTitlePage(splitLines(stringifyFountain(input.script))),
  );

  if (merged.title.length > 0) {
    return merged;
  }

  const fallbackTitle = fallbackDisplayName(input.displayName, input.filePath);

  if (fallbackTitle && fallbackTitle.toLowerCase() !== 'untitled') {
    return { ...merged, title: [fallbackTitle] };
  }

  return merged;
}
