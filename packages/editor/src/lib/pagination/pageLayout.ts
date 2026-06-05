import type { PageFormat } from '../ScriptEditor';

export const PT_PER_INCH = 72;
export const SCRIPT_LINE_HEIGHT_PT = 12;

export type PageLayout = {
  pageHeightPt: number;
  paddingTopPt: number;
  paddingRightPt: number;
  paddingBottomPt: number;
  paddingLeftPt: number;
  contentHeightPt: number;
  linesPerPage: number;
  charsPerLine: number;
};

const US_LETTER_LAYOUT: PageLayout = {
  pageHeightPt: 11 * PT_PER_INCH,
  paddingTopPt: PT_PER_INCH,
  paddingRightPt: PT_PER_INCH,
  paddingBottomPt: PT_PER_INCH,
  paddingLeftPt: 1.5 * PT_PER_INCH,
  contentHeightPt: 9 * PT_PER_INCH,
  linesPerPage: 54,
  charsPerLine: 61,
};

const A4_LAYOUT: PageLayout = {
  pageHeightPt: (297 / 25.4) * PT_PER_INCH,
  paddingTopPt: (25.4 / 25.4) * PT_PER_INCH,
  paddingRightPt: (25.4 / 25.4) * PT_PER_INCH,
  paddingBottomPt: (25.4 / 25.4) * PT_PER_INCH,
  paddingLeftPt: (38.1 / 25.4) * PT_PER_INCH,
  contentHeightPt: ((297 - 25.4 - 25.4) / 25.4) * PT_PER_INCH,
  linesPerPage: 54,
  charsPerLine: 61,
};

export function getPageLayout(pageFormat: PageFormat): PageLayout {
  return pageFormat === 'a4' ? A4_LAYOUT : US_LETTER_LAYOUT;
}
