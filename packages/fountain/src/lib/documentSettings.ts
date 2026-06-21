export type PageFormat = 'us-letter' | 'a4';
export type Typeface = 'courier-prime' | 'courier-new' | 'monospace';

export type ParsedDocumentSettings = {
  pageFormat: PageFormat;
  typeface: Typeface;
  /** Ordered lines inside the settings block, excluding header and footer. */
  settingsLines: string[];
  hadDocumentSettingsBlock: boolean;
};

export const DEFAULT_PAGE_FORMAT: PageFormat = 'us-letter';
export const DEFAULT_TYPEFACE: Typeface = 'courier-prime';

const DOCUMENT_SETTINGS_HEADER = '{{Slugline Document Settings';
const DOCUMENT_SETTINGS_FOOTER = '}}';

const PAGE_FORMAT_VALUES: Record<string, PageFormat> = {
  'us letter': 'us-letter',
  a4: 'a4',
};

const TYPEFACE_VALUES: Record<string, Typeface> = {
  'courier prime': 'courier-prime',
  'courier new': 'courier-new',
  monospace: 'monospace',
};

function normaliseSettingValue(value: string): string {
  return value.trim().toLowerCase();
}

function parseSettingLine(line: string): { key: string; value: string } | null {
  const match = /^([^:]+):\s*(.*)$/.exec(line.trim());

  if (!match) {
    return null;
  }

  return { key: match[1].trim(), value: match[2].trim() };
}

function pageFormatFromSlugline(value: string): PageFormat | undefined {
  return PAGE_FORMAT_VALUES[normaliseSettingValue(value)];
}

function typefaceFromSlugline(value: string): Typeface | undefined {
  return TYPEFACE_VALUES[normaliseSettingValue(value)];
}

function pageFormatToSlugline(pageFormat: PageFormat): string {
  return pageFormat === 'a4' ? 'A4' : 'US Letter';
}

function typefaceToSlugline(typeface: Typeface): string {
  switch (typeface) {
    case 'courier-new':
      return 'Courier New';
    case 'monospace':
      return 'Monospace';
    default:
      return 'Courier Prime';
  }
}

export type DocumentSettingsSection = {
  settings: ParsedDocumentSettings;
  bodyEndIndex: number;
};

function isDocumentSettingsOpener(trimmed: string): boolean {
  return trimmed.startsWith(DOCUMENT_SETTINGS_HEADER);
}

function findDocumentSettingsStart(lines: string[]): number {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (isDocumentSettingsOpener(lines[index].trim())) {
      return index;
    }
  }

  return -1;
}

export function extractDocumentSettingsSection(
  lines: string[],
): DocumentSettingsSection {
  const startIndex = findDocumentSettingsStart(lines);

  if (startIndex === -1) {
    return {
      settings: {
        pageFormat: DEFAULT_PAGE_FORMAT,
        typeface: DEFAULT_TYPEFACE,
        settingsLines: [],
        hadDocumentSettingsBlock: false,
      },
      bodyEndIndex: lines.length,
    };
  }

  let pageFormat = DEFAULT_PAGE_FORMAT;
  let typeface = DEFAULT_TYPEFACE;
  const settingsLines: string[] = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();

    if (trimmed === DOCUMENT_SETTINGS_FOOTER) {
      break;
    }

    settingsLines.push(lines[index]);

    const parsed = parseSettingLine(lines[index]);

    if (!parsed) {
      continue;
    }

    const pageFormatValue = pageFormatFromSlugline(parsed.value);

    if (parsed.key.toLowerCase() === 'page format' && pageFormatValue) {
      pageFormat = pageFormatValue;
      continue;
    }

    const typefaceValue = typefaceFromSlugline(parsed.value);

    if (parsed.key.toLowerCase() === 'typeface' && typefaceValue) {
      typeface = typefaceValue;
    }
  }

  return {
    settings: {
      pageFormat,
      typeface,
      settingsLines,
      hadDocumentSettingsBlock: true,
    },
    bodyEndIndex: startIndex,
  };
}

function buildSettingsInnerLines(
  settings: Pick<ParsedDocumentSettings, 'settingsLines'>,
  pageFormat: PageFormat,
  typeface: Typeface,
): string[] {
  const pageFormatLine = `Page Format: ${pageFormatToSlugline(pageFormat)}`;
  const typefaceLine = `Typeface: ${typefaceToSlugline(typeface)}`;
  let hasPageFormat = false;
  let hasTypeface = false;

  const lines = settings.settingsLines.map((line) => {
    const parsed = parseSettingLine(line);

    if (parsed?.key.toLowerCase() === 'page format') {
      hasPageFormat = true;
      return pageFormatLine;
    }

    if (parsed?.key.toLowerCase() === 'typeface') {
      hasTypeface = true;
      return typefaceLine;
    }

    return line;
  });

  if (!hasPageFormat) {
    lines.unshift(pageFormatLine);
  }

  if (!hasTypeface) {
    lines.push(typefaceLine);
  }

  return lines;
}

export function stringifyDocumentSettingsBlock(
  pageFormat: PageFormat,
  typeface: Typeface,
  settings: Pick<ParsedDocumentSettings, 'settingsLines'>,
): string[] {
  return [
    DOCUMENT_SETTINGS_HEADER,
    ...buildSettingsInnerLines(settings, pageFormat, typeface),
    DOCUMENT_SETTINGS_FOOTER,
  ];
}

export function shouldPersistDocumentSettings(
  settings: ParsedDocumentSettings,
  persistDocumentSettings: boolean,
): boolean {
  if (persistDocumentSettings) {
    return true;
  }

  return (
    settings.hadDocumentSettingsBlock ||
    settings.pageFormat !== DEFAULT_PAGE_FORMAT ||
    settings.typeface !== DEFAULT_TYPEFACE
  );
}
