import type { ScriptTypeface } from '../ScriptEditor';
import {
  PT_PER_INCH,
  SCRIPT_LINE_HEIGHT_PT,
  type PageLayout,
} from './pageLayout';
import type { ScriptBlock, ScriptElementType } from './types';

/** Pica table: characters per inch at 12pt for each screenplay typeface. */
export const TYPEFACE_CHARS_PER_INCH_AT_12PT: Record<ScriptTypeface, number> = {
  'courier-prime': 10,
  'courier-new': 10,
  monospace: 10,
};

export const DEFAULT_SCRIPT_TYPEFACE: ScriptTypeface = 'courier-prime';

/** Theme dialogue block uses border-box `max-width: 400px` with `padding-left: 1.5in`. */
const DIALOGUE_BOX_MAX_WIDTH_PT = (400 / 96) * PT_PER_INCH;
const DIALOGUE_PADDING_LEFT_PT = 1.5 * PT_PER_INCH;
const DIALOGUE_CONTENT_WIDTH_PT =
  DIALOGUE_BOX_MAX_WIDTH_PT - DIALOGUE_PADDING_LEFT_PT;

export type ElementMetrics = {
  fontSizePt: number;
  lineHeightPt: number;
  marginTopPt: number;
  marginBottomPt: number;
  contentWidthPt: number | 'full';
  /** Screenplay line budget (54 lines per page). */
  countsTowardPageLines: boolean;
  /** Printable vertical space and page-boundary placement. */
  countsTowardPageHeight: boolean;
};

export const ELEMENT_METRICS: Record<ScriptElementType, ElementMetrics> = {
  action: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  centeredText: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  sceneHeading: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  character: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  parenthetical: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: DIALOGUE_CONTENT_WIDTH_PT,
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  dialogue: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: DIALOGUE_CONTENT_WIDTH_PT,
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  transition: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  section: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: true,
  },
  synopsis: {
    fontSizePt: 11,
    lineHeightPt: 11,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: true,
  },
  note: {
    fontSizePt: 11,
    lineHeightPt: 11,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: true,
  },
  titlePage: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: false,
  },
  pageBreak: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: false,
  },
  splitDialogueCharacter: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: 0,
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: false,
  },
};

export function blockCountsTowardPageHeight(type: ScriptElementType): boolean {
  return ELEMENT_METRICS[type].countsTowardPageHeight;
}

export function contentWidthPt(
  metrics: ElementMetrics,
  layout: PageLayout,
): number {
  if (metrics.contentWidthPt === 'full') {
    return layout.contentAreaWidthPt;
  }

  return metrics.contentWidthPt;
}

export function charsPerLine(
  metrics: ElementMetrics,
  layout: PageLayout,
  typeface: ScriptTypeface = DEFAULT_SCRIPT_TYPEFACE,
): number {
  const widthPt = contentWidthPt(metrics, layout);
  const inches = widthPt / PT_PER_INCH;
  const charsPerInch =
    TYPEFACE_CHARS_PER_INCH_AT_12PT[typeface] * (metrics.fontSizePt / 12);

  return Math.max(1, Math.floor(inches * charsPerInch));
}

export function countTextLines(
  text: string,
  charsPerLineCount: number,
): number {
  return wrapTextLines(text, charsPerLineCount).length;
}

export type WrappedTextLine = {
  startOffset: number;
  endOffset: number;
};

function wrapParagraphLines(
  paragraph: string,
  paragraphStart: number,
  charsPerLineCount: number,
): WrappedTextLine[] {
  if (paragraph.length === 0) {
    return [{ startOffset: paragraphStart, endOffset: paragraphStart }];
  }

  const lines: WrappedTextLine[] = [];
  let index = 0;

  while (index < paragraph.length) {
    const remaining = paragraph.length - index;

    if (remaining <= charsPerLineCount) {
      lines.push({
        startOffset: paragraphStart + index,
        endOffset: paragraphStart + paragraph.length,
      });
      break;
    }

    const window = paragraph.slice(index, index + charsPerLineCount);
    const lastSpace = window.lastIndexOf(' ');
    const breakLength = lastSpace > 0 ? lastSpace : charsPerLineCount;

    lines.push({
      startOffset: paragraphStart + index,
      endOffset: paragraphStart + index + breakLength,
    });

    index += breakLength;
    while (index < paragraph.length && paragraph[index] === ' ') {
      index += 1;
    }
  }

  return lines;
}

export function wrapTextLines(
  text: string,
  charsPerLineCount: number,
): WrappedTextLine[] {
  if (text.length === 0) {
    return [{ startOffset: 0, endOffset: 0 }];
  }

  const lines: WrappedTextLine[] = [];
  let paragraphStart = 0;

  for (const paragraph of text.split('\n')) {
    lines.push(
      ...wrapParagraphLines(paragraph, paragraphStart, charsPerLineCount),
    );
    paragraphStart += paragraph.length + 1;
  }

  return lines;
}

export type BlockMeasurement = {
  heightPt: number;
  paginationLines: number;
  marginBottomPt: number;
  textLineCount: number;
  textLines: WrappedTextLine[];
  lineHeightPt: number;
  collapsedMarginTopPt: number;
};

export function measureBlock(
  block: ScriptBlock,
  layout: PageLayout,
  previousMarginBottomPt: number,
  typeface: ScriptTypeface = DEFAULT_SCRIPT_TYPEFACE,
): BlockMeasurement {
  const metrics = ELEMENT_METRICS[block.type];
  const collapsedMarginTopPt = Math.max(
    metrics.marginTopPt,
    previousMarginBottomPt,
  );
  const textLines = wrapTextLines(
    block.text,
    charsPerLine(metrics, layout, typeface),
  );
  const textLineCount = textLines.length;
  const lineHeightPt =
    metrics.lineHeightPt === SCRIPT_LINE_HEIGHT_PT
      ? metrics.fontSizePt
      : metrics.lineHeightPt;
  const textHeightPt = textLineCount * lineHeightPt;
  const heightPt = collapsedMarginTopPt + textHeightPt + metrics.marginBottomPt;
  const paginationLines = metrics.countsTowardPageLines
    ? Math.ceil(heightPt / SCRIPT_LINE_HEIGHT_PT)
    : 0;

  return {
    heightPt,
    paginationLines,
    marginBottomPt: metrics.marginBottomPt,
    textLineCount,
    textLines,
    lineHeightPt,
    collapsedMarginTopPt,
  };
}
