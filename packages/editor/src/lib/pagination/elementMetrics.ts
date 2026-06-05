import {
  PT_PER_INCH,
  SCRIPT_LINE_HEIGHT_PT,
  type PageLayout,
} from './pageLayout';
import type { ScriptBlock, ScriptElementType } from './types';

/** Pica table: 10 characters per inch at 12pt Courier (matches theme printable width). */
const PICA_CHARS_PER_INCH_AT_12PT = 10;

/** Dialogue column width from theme (`max-width: 400px` at 96dpi). */
const DIALOGUE_CONTENT_WIDTH_PT = (400 / 96) * PT_PER_INCH;

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

function emToPt(em: number, fontSizePt: number): number {
  return em * fontSizePt;
}

export const ELEMENT_METRICS: Record<ScriptElementType, ElementMetrics> = {
  action: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: emToPt(1, 12),
    marginBottomPt: 0,
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  sceneHeading: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: emToPt(1.5, 12),
    marginBottomPt: emToPt(0.5, 12),
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  character: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT * 2,
    marginTopPt: emToPt(1, 12),
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
    contentWidthPt: 'full',
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
    marginTopPt: emToPt(1, 12),
    marginBottomPt: emToPt(1, 12),
    contentWidthPt: 'full',
    countsTowardPageLines: true,
    countsTowardPageHeight: true,
  },
  section: {
    fontSizePt: 12,
    lineHeightPt: SCRIPT_LINE_HEIGHT_PT,
    marginTopPt: emToPt(1.25, 12),
    marginBottomPt: emToPt(0.25, 12),
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: true,
  },
  synopsis: {
    fontSizePt: 11,
    lineHeightPt: 11,
    marginTopPt: emToPt(0.5, 11),
    marginBottomPt: emToPt(0.5, 11),
    contentWidthPt: 'full',
    countsTowardPageLines: false,
    countsTowardPageHeight: true,
  },
  note: {
    fontSizePt: 11,
    lineHeightPt: 11,
    marginTopPt: emToPt(0.5, 11),
    marginBottomPt: emToPt(0.5, 11),
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
): number {
  const widthPt = contentWidthPt(metrics, layout);
  const inches = widthPt / PT_PER_INCH;
  const charsPerInch = PICA_CHARS_PER_INCH_AT_12PT * (metrics.fontSizePt / 12);

  return Math.max(1, Math.floor(inches * charsPerInch));
}

export function countTextLines(
  text: string,
  charsPerLineCount: number,
): number {
  if (text.length === 0) {
    return 1;
  }

  return text.split('\n').reduce((total, paragraph) => {
    if (paragraph.length === 0) {
      return total + 1;
    }

    return total + Math.max(1, Math.ceil(paragraph.length / charsPerLineCount));
  }, 0);
}

export type BlockMeasurement = {
  heightPt: number;
  paginationLines: number;
  marginBottomPt: number;
};

export function measureBlock(
  block: ScriptBlock,
  layout: PageLayout,
  previousMarginBottomPt: number,
): BlockMeasurement {
  const metrics = ELEMENT_METRICS[block.type];
  const collapsedMarginTopPt = Math.max(
    metrics.marginTopPt,
    previousMarginBottomPt,
  );
  const textLineCount = countTextLines(
    block.text,
    charsPerLine(metrics, layout),
  );
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
  };
}
