import { getPageLayout } from './pageLayout';
import type { ScriptPage } from './types';

export function resolvePageNumberTopPt(
  page: ScriptPage,
  pageFormat: 'us-letter' | 'a4',
  hasTitlePage: boolean,
): number {
  const layout = getPageLayout(pageFormat);
  const sheetIndex = hasTitlePage ? page.number : page.number - 1;

  return layout.pageHeightPt * sheetIndex + layout.paddingTopPt;
}
