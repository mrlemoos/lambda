export type FountainPageFormat = 'us-letter' | 'a4';

const SETTINGS_HEADING = '{{Slugline Document Settings';
const SETTINGS_CLOSE = '}}';

export function isSluglineSettingsOpenLine(line: string): boolean {
  return line.trimStart().startsWith(SETTINGS_HEADING);
}

export function parsePageFormatFromSettings(
  settingsLines: string[],
): FountainPageFormat {
  for (const line of settingsLines) {
    const match = /^Page Format:\s*(.+)$/i.exec(line.trim());

    if (!match) {
      continue;
    }

    const value = match[1].trim().toLowerCase();

    if (value === 'a4') {
      return 'a4';
    }

    if (value.includes('letter') || value.includes('us')) {
      return 'us-letter';
    }
  }

  return 'us-letter';
}

export function extractSluglineDocumentSettings(lines: string[]): {
  bodyLines: string[];
  sluglineSettings: string[] | undefined;
  pageFormat: FountainPageFormat;
} {
  let end = lines.length;

  while (end > 0 && lines[end - 1].trim().length === 0) {
    end -= 1;
  }

  if (end === 0 || lines[end - 1].trim() !== SETTINGS_CLOSE) {
    return {
      bodyLines: lines,
      sluglineSettings: undefined,
      pageFormat: 'us-letter',
    };
  }

  let openIndex = -1;

  for (let index = end - 2; index >= 0; index -= 1) {
    if (isSluglineSettingsOpenLine(lines[index])) {
      openIndex = index;
      break;
    }
  }

  if (openIndex === -1) {
    return {
      bodyLines: lines,
      sluglineSettings: undefined,
      pageFormat: 'us-letter',
    };
  }

  const settingsLines = lines.slice(openIndex + 1, end - 1);
  let bodyEnd = openIndex;

  while (bodyEnd > 0 && lines[bodyEnd - 1].trim().length === 0) {
    bodyEnd -= 1;
  }

  return {
    bodyLines: lines.slice(0, bodyEnd),
    sluglineSettings: settingsLines,
    pageFormat: parsePageFormatFromSettings(settingsLines),
  };
}

export function formatSluglineDocumentSettingsBlock(
  settingsLines: string[],
): string[] {
  return [SETTINGS_HEADING, ...settingsLines, SETTINGS_CLOSE];
}
