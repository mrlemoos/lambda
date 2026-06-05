import type { PageLayout } from './pageLayout';
import type { PaginationResult } from './types';

export function resolveScriptSheetHeightPt(
  pagination: PaginationResult,
  layout: PageLayout,
): number {
  const measuredHeightPt =
    layout.paddingTopPt + pagination.totalHeightPt + layout.paddingBottomPt;

  return Math.max(layout.pageHeightPt, measuredHeightPt);
}
