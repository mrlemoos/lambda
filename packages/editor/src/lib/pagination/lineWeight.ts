import type { PageLayout } from './pageLayout';
import { measureBlock } from './elementMetrics';
import type { ScriptBlock } from './types';

export function measureBlockHeightPt(
  block: ScriptBlock,
  layout: PageLayout,
  previousMarginBottomPt: number,
): number {
  return measureBlock(block, layout, previousMarginBottomPt).heightPt;
}

export function paginationLineWeight(
  block: ScriptBlock,
  layout: PageLayout,
  previousMarginBottomPt: number,
): number {
  return measureBlock(block, layout, previousMarginBottomPt).paginationLines;
}

export function visualHeightPt(
  block: ScriptBlock,
  layout: PageLayout,
  previousMarginBottomPt: number,
): number {
  return measureBlock(block, layout, previousMarginBottomPt).heightPt;
}
