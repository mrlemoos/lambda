import {
  getPageLayout,
  SCRIPT_LINE_HEIGHT_PT,
  type PageFormat,
  type ScriptTypeface,
} from '@lambda/editor';

import { expandPreviewFragmentLines } from './formatPaginatedFragmentText';
import type { PreviewFragment } from './previewTypes';

/** Last content line on split-dialogue pages — reserved for (MORE). */
export const SPLIT_DIALOGUE_MORE_RESERVED_PT = SCRIPT_LINE_HEIGHT_PT;

/** Flow content must end before the (MORE) row. */
export function maxFlowBottomPt(
  fragment: PreviewFragment,
  contentHeightPt: number,
): number {
  if (fragment.paginationLineCount !== undefined) {
    return contentHeightPt - SPLIT_DIALOGUE_MORE_RESERVED_PT;
  }

  return contentHeightPt;
}

export type ResolvedFlowLayout = {
  tops: number[];
  lineCounts: number[];
};

/** Pagination top for the first rendered line of a fragment (page-relative pt). */
export function naturalFragmentTopPt(
  fragment: PreviewFragment,
  pageContentTopOffsetPt: number,
): number {
  return (
    fragment.topOffsetPt - pageContentTopOffsetPt + (fragment.marginTopPt ?? 0)
  );
}

/**
 * Pagination may assign the same (or near) topOffsetPt to blocks that still
 * occupy distinct visual lines (e.g. zero-weight split-dialogue cues, or a
 * parenthetical and the dialogue that follows it). Walk fragments in document
 * order with a monotonic cursor so no fragment is ever placed above the bottom
 * of the previous one — overlap-free by construction. Every fragment renders
 * all of its lines; we never trim a fragment to fit the next one's slot, which
 * would silently drop dialogue. Pagination already sized the gaps, so blocks
 * land at their natural tops; any preview/pagination wrap drift just nudges the
 * following blocks down rather than losing text.
 */
export function resolveFlowFragmentTops(
  fragments: PreviewFragment[],
  pageContentTopOffsetPt: number,
  pageFormat: PageFormat,
  typeface: ScriptTypeface,
): ResolvedFlowLayout {
  const layout = getPageLayout(pageFormat);
  let cursorPt = 0;
  const tops: number[] = [];
  const lineCounts: number[] = [];

  for (
    let fragmentIndex = 0;
    fragmentIndex < fragments.length;
    fragmentIndex += 1
  ) {
    const fragment = fragments[fragmentIndex];
    const lines = expandPreviewFragmentLines(fragment, pageFormat, typeface);
    const naturalTop = naturalFragmentTopPt(fragment, pageContentTopOffsetPt);
    // Never place a fragment above the previous one's bottom.
    const placedTop = Math.max(naturalTop, cursorPt);
    const flowBottomPt = maxFlowBottomPt(fragment, layout.contentHeightPt);
    // Bound only by the page bottom / (MORE) reservation — never by the next
    // fragment, so split dialogue keeps all its continuation lines.
    const maxLinesByFooter = Math.floor(
      (flowBottomPt - placedTop) / SCRIPT_LINE_HEIGHT_PT,
    );
    let lineCount = Math.min(
      lines.length,
      fragment.paginationLineCount ?? lines.length,
      maxLinesByFooter,
    );
    // A fragment with text must always render at least one line; dropping it to
    // zero is what previously triggered an overlapping fallback placement.
    if (lineCount <= 0 && lines.length > 0) {
      lineCount = 1;
    }

    tops.push(placedTop);
    lineCounts.push(lineCount);
    cursorPt = placedTop + lineCount * SCRIPT_LINE_HEIGHT_PT;
  }

  return { tops, lineCounts };
}
