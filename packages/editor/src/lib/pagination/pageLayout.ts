import type { PageFormat } from '../ScriptEditor';

export const PT_PER_INCH = 72;
export const SCRIPT_LINE_HEIGHT_PT = 12;

/** One script line of space below a page boundary before body content resumes. */
export const PAGE_TOP_GUTTER_PT = SCRIPT_LINE_HEIGHT_PT;

/**
 * Extra margin when a block is pushed past a boundary the model still considers
 * on the previous page (DOM flow is slightly taller than pure pt metrics).
 */
export const PAGE_STRADDLE_GUARD_PT = SCRIPT_LINE_HEIGHT_PT;

export type PageLayout = {
  pageWidthPt: number;
  pageHeightPt: number;
  paddingTopPt: number;
  paddingRightPt: number;
  paddingBottomPt: number;
  paddingLeftPt: number;
  contentAreaWidthPt: number;
  contentHeightPt: number;
  pageTopGutterPt: number;
  linesPerPage: number;
};

const US_LETTER_PAGE_WIDTH_PT = 8.5 * PT_PER_INCH;
const US_LETTER_PADDING = {
  top: PT_PER_INCH,
  right: PT_PER_INCH,
  bottom: PT_PER_INCH,
  left: 1.5 * PT_PER_INCH,
};

const US_LETTER_LAYOUT: PageLayout = {
  pageWidthPt: US_LETTER_PAGE_WIDTH_PT,
  pageHeightPt: 11 * PT_PER_INCH,
  paddingTopPt: US_LETTER_PADDING.top,
  paddingRightPt: US_LETTER_PADDING.right,
  paddingBottomPt: US_LETTER_PADDING.bottom,
  paddingLeftPt: US_LETTER_PADDING.left,
  contentAreaWidthPt:
    US_LETTER_PAGE_WIDTH_PT - US_LETTER_PADDING.left - US_LETTER_PADDING.right,
  contentHeightPt: 9 * PT_PER_INCH,
  pageTopGutterPt: PAGE_TOP_GUTTER_PT,
  linesPerPage: 54,
};

const A4_PAGE_WIDTH_PT = (210 / 25.4) * PT_PER_INCH;
const A4_PADDING = {
  top: (25.4 / 25.4) * PT_PER_INCH,
  right: (25.4 / 25.4) * PT_PER_INCH,
  bottom: (25.4 / 25.4) * PT_PER_INCH,
  left: (38.1 / 25.4) * PT_PER_INCH,
};

const A4_LAYOUT: PageLayout = {
  pageWidthPt: A4_PAGE_WIDTH_PT,
  pageHeightPt: (297 / 25.4) * PT_PER_INCH,
  paddingTopPt: A4_PADDING.top,
  paddingRightPt: A4_PADDING.right,
  paddingBottomPt: A4_PADDING.bottom,
  paddingLeftPt: A4_PADDING.left,
  contentAreaWidthPt: A4_PAGE_WIDTH_PT - A4_PADDING.left - A4_PADDING.right,
  contentHeightPt: ((297 - 25.4 - 25.4) / 25.4) * PT_PER_INCH,
  pageTopGutterPt: PAGE_TOP_GUTTER_PT,
  linesPerPage: 54,
};

export function getPageLayout(pageFormat: PageFormat): PageLayout {
  return pageFormat === 'a4' ? A4_LAYOUT : US_LETTER_LAYOUT;
}

/** Script lines that fit on a body page (page 1 uses the full sheet). */
export function linesBudgetForBodyPage(
  bodyPageNumber: number,
  layout: PageLayout,
): number {
  if (bodyPageNumber <= 1) {
    return layout.linesPerPage;
  }

  return Math.floor(
    (layout.contentHeightPt - layout.pageTopGutterPt) / SCRIPT_LINE_HEIGHT_PT,
  );
}
