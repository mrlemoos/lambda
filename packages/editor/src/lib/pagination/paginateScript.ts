import type { PageFormat } from '../ScriptEditor';
import { blockCountsTowardPageHeight, measureBlock } from './elementMetrics';
import {
  getPageLayout,
  linesBudgetForBodyPage,
  PAGE_STRADDLE_GUARD_PT,
  type PageLayout,
} from './pageLayout';
import type {
  BlockPlacement,
  PageBoundary,
  PaginationResult,
  ScriptBlock,
  ScriptPage,
} from './types';

function pageBottom(pageStartOffsetPt: number, layout: PageLayout): number {
  return pageStartOffsetPt + layout.contentHeightPt;
}

function contentTopAfterBoundary(
  boundaryOffsetPt: number,
  pageTopGutterPt: number,
): number {
  return boundaryOffsetPt + pageTopGutterPt;
}

function pageBreakMarginTop(
  advance: ReturnType<typeof advanceToNextPage>,
  contentOffsetPt: number,
  baseMarginTopPt: number,
): number {
  if (contentOffsetPt < advance.boundaryOffsetPt) {
    return baseMarginTopPt + PAGE_STRADDLE_GUARD_PT;
  }

  return baseMarginTopPt;
}

function advanceToNextPage(
  layout: PageLayout,
  pageStartOffsetPt: number,
  contentOffsetPt: number,
): {
  boundaryOffsetPt: number;
  marginTopPt: number;
  nextContentTopPt: number;
} {
  const boundaryOffsetPt = pageBottom(pageStartOffsetPt, layout);
  const nextContentTopPt = contentTopAfterBoundary(
    boundaryOffsetPt,
    layout.pageTopGutterPt,
  );

  return {
    boundaryOffsetPt,
    marginTopPt: nextContentTopPt - contentOffsetPt,
    nextContentTopPt,
  };
}

export function paginateScript(
  blocks: ScriptBlock[],
  pageFormat: PageFormat = 'us-letter',
): PaginationResult {
  const layout = getPageLayout(pageFormat);
  const pages: ScriptPage[] = [];
  const boundaries: PageBoundary[] = [];
  const placements: BlockPlacement[] = [];
  let contentOffsetPt = 0;
  let pageStartOffsetPt = 0;
  let linesUsedOnPage = 0;
  let bodyPageNumber = 0;
  let previousMarginBottomPt = 0;

  const pushBoundary = (offsetPt: number) => {
    if (
      boundaries.length > 0 &&
      boundaries[boundaries.length - 1].offsetPt === offsetPt
    ) {
      return;
    }

    boundaries.push({ offsetPt });
  };

  const startBodyPage = (topOffsetPt: number) => {
    bodyPageNumber += 1;
    pages.push({ number: bodyPageNumber, topOffsetPt });
    pageStartOffsetPt = topOffsetPt;
    linesUsedOnPage = 0;
    previousMarginBottomPt = 0;
  };

  const ensureFirstBodyPage = () => {
    if (bodyPageNumber === 0) {
      startBodyPage(contentOffsetPt);
    }
  };

  for (const block of blocks) {
    let marginTopPt = 0;
    const measurement = measureBlock(block, layout, previousMarginBottomPt);
    const { heightPt, paginationLines } = measurement;

    if (block.type === 'titlePage') {
      bodyPageNumber = 0;
      linesUsedOnPage = 0;
      pages.length = 0;
      boundaries.length = 0;
      pageStartOffsetPt = 0;
      previousMarginBottomPt = 0;
      contentOffsetPt = layout.contentHeightPt;
      pushBoundary(contentOffsetPt);
      placements.push({ marginTopPt: 0, topOffsetPt: 0 });
      continue;
    }

    if (block.type === 'pageBreak') {
      ensureFirstBodyPage();

      if (linesUsedOnPage > 0 || contentOffsetPt > pageStartOffsetPt) {
        const advance = advanceToNextPage(
          layout,
          pageStartOffsetPt,
          contentOffsetPt,
        );

        marginTopPt = pageBreakMarginTop(
          advance,
          contentOffsetPt,
          advance.marginTopPt,
        );
        contentOffsetPt = advance.nextContentTopPt;
        pushBoundary(advance.boundaryOffsetPt);
        startBodyPage(advance.boundaryOffsetPt);
      }

      placements.push({ marginTopPt, topOffsetPt: contentOffsetPt });
      previousMarginBottomPt = measurement.marginBottomPt;
      continue;
    }

    if (block.type === 'splitDialogueCharacter') {
      ensureFirstBodyPage();
      placements.push({ marginTopPt: 0, topOffsetPt: contentOffsetPt });
      contentOffsetPt += heightPt;
      previousMarginBottomPt = measurement.marginBottomPt;
      continue;
    }

    if (!blockCountsTowardPageHeight(block.type)) {
      continue;
    }

    ensureFirstBodyPage();

    const bottom = pageBottom(pageStartOffsetPt, layout);
    const blockEndPt = contentOffsetPt + heightPt;
    const linesBudget = linesBudgetForBodyPage(bodyPageNumber, layout);
    const wouldExceedLines =
      paginationLines > 0 &&
      linesUsedOnPage > 0 &&
      linesUsedOnPage + paginationLines > linesBudget;
    const remainingPt = bottom - contentOffsetPt;
    const wouldExceedVisual =
      heightPt > 0 &&
      (contentOffsetPt >= bottom ||
        blockEndPt > bottom ||
        remainingPt + 0.5 < heightPt);

    if (wouldExceedLines || wouldExceedVisual) {
      const advance = advanceToNextPage(
        layout,
        pageStartOffsetPt,
        contentOffsetPt,
      );

      marginTopPt = pageBreakMarginTop(
        advance,
        contentOffsetPt,
        advance.marginTopPt,
      );
      contentOffsetPt = advance.nextContentTopPt;
      pushBoundary(advance.boundaryOffsetPt);
      startBodyPage(advance.boundaryOffsetPt);
    }

    placements.push({ marginTopPt, topOffsetPt: contentOffsetPt });
    if (paginationLines > 0) {
      linesUsedOnPage += paginationLines;
    }
    contentOffsetPt += heightPt;
    previousMarginBottomPt = measurement.marginBottomPt;
  }

  if (bodyPageNumber === 0) {
    startBodyPage(contentOffsetPt);
  }

  const lastPageStart =
    pages.length > 0 ? pages[pages.length - 1].topOffsetPt : 0;
  const totalHeightPt = Math.max(
    contentOffsetPt,
    lastPageStart + layout.contentHeightPt,
  );

  return {
    pages,
    boundaries,
    placements,
    totalHeightPt,
    pageFormat,
  };
}
