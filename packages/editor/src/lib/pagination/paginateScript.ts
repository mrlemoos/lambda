import type { PageFormat } from '../ScriptEditor';
import { blockCountsTowardPageHeight, measureBlock } from './elementMetrics';
import {
  getPageLayout,
  linesBudgetForBodyPage,
  PAGE_STRADDLE_GUARD_PT,
  SCRIPT_LINE_HEIGHT_PT,
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

const MIN_SPLIT_LINES = 2;

function canSplitBlock(block: ScriptBlock): boolean {
  return block.type === 'action' || block.type === 'dialogue';
}

function marginLineCount(marginTopPt: number): number {
  return Math.ceil(marginTopPt / SCRIPT_LINE_HEIGHT_PT);
}

function isOutlineBlock(block: ScriptBlock | undefined): boolean {
  return (
    block?.type === 'section' ||
    block?.type === 'synopsis' ||
    block?.type === 'note'
  );
}

function keepClusterEndIndex(
  blocks: ScriptBlock[],
  blockIndex: number,
): number {
  const block = blocks[blockIndex];

  if (block.type === 'sceneHeading' && blocks[blockIndex + 1]) {
    return blockIndex + 1;
  }

  if (block.type === 'character') {
    let endIndex = blockIndex;

    while (blocks[endIndex + 1]?.type === 'parenthetical') {
      endIndex += 1;
    }

    if (blocks[endIndex + 1]?.type === 'dialogue') {
      endIndex += 1;
    }

    return endIndex;
  }

  if (block.type === 'section') {
    let endIndex = blockIndex;

    while (isOutlineBlock(blocks[endIndex + 1])) {
      endIndex += 1;
    }

    if (
      blocks[endIndex + 1] &&
      blockCountsTowardPageHeight(blocks[endIndex + 1].type)
    ) {
      endIndex += 1;
    }

    return endIndex;
  }

  if (blocks[blockIndex + 1]?.type === 'transition') {
    return blockIndex + 1;
  }

  return blockIndex;
}

function measureKeepCluster(
  blocks: ScriptBlock[],
  blockIndex: number,
  layout: PageLayout,
  previousMarginBottomPt: number,
): { heightPt: number; paginationLines: number } | null {
  const endIndex = keepClusterEndIndex(blocks, blockIndex);

  if (endIndex === blockIndex) {
    return null;
  }

  let heightPt = 0;
  let paginationLines = 0;
  let localPreviousMarginBottomPt = previousMarginBottomPt;

  for (let index = blockIndex; index <= endIndex; index += 1) {
    const block = blocks[index];

    if (!blockCountsTowardPageHeight(block.type)) {
      continue;
    }

    const measurement = measureBlock(
      block,
      layout,
      localPreviousMarginBottomPt,
    );
    const keepOnlyOpeningLines = index > blockIndex && canSplitBlock(block);
    const keptTextLines = keepOnlyOpeningLines
      ? Math.min(measurement.textLineCount, MIN_SPLIT_LINES)
      : measurement.textLineCount;
    const keptHeightPt = keepOnlyOpeningLines
      ? measurement.collapsedMarginTopPt +
        keptTextLines * measurement.lineHeightPt
      : measurement.heightPt;
    const keptPaginationLines = keepOnlyOpeningLines
      ? marginLineCount(measurement.collapsedMarginTopPt) + keptTextLines
      : measurement.paginationLines;

    heightPt += keptHeightPt;
    paginationLines += keptPaginationLines;
    localPreviousMarginBottomPt = measurement.marginBottomPt;
  }

  return { heightPt, paginationLines };
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

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];
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

    const keepCluster = measureKeepCluster(
      blocks,
      blockIndex,
      layout,
      previousMarginBottomPt,
    );

    if (
      keepCluster &&
      (contentOffsetPt > pageStartOffsetPt || linesUsedOnPage > 0)
    ) {
      const bottom = pageBottom(pageStartOffsetPt, layout);
      const linesBudget = linesBudgetForBodyPage(bodyPageNumber, layout);
      const wouldOrphanCluster =
        contentOffsetPt + keepCluster.heightPt > bottom ||
        linesUsedOnPage + keepCluster.paginationLines > linesBudget;

      if (
        wouldOrphanCluster &&
        keepCluster.heightPt <= layout.contentHeightPt
      ) {
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
    }

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
      if (
        canSplitBlock(block) &&
        measurement.textLineCount >= MIN_SPLIT_LINES * 2
      ) {
        let splitLineIndex = 0;
        let blockTopOffsetPt = contentOffsetPt;
        let blockMarginTopPt = 0;
        const pageStarts: NonNullable<BlockPlacement['pageStarts']> = [];
        let isFirstFragment = true;

        while (splitLineIndex < measurement.textLineCount) {
          const linesRemaining = measurement.textLineCount - splitLineIndex;
          const marginTopForFragment = isFirstFragment
            ? measurement.collapsedMarginTopPt
            : 0;
          const bottomForFragment = pageBottom(pageStartOffsetPt, layout);
          const availableHeightPt = Math.max(
            0,
            bottomForFragment - contentOffsetPt - marginTopForFragment,
          );
          const visualLineCapacity = Math.floor(
            availableHeightPt / measurement.lineHeightPt,
          );
          const linesBudget = linesBudgetForBodyPage(bodyPageNumber, layout);
          const budgetLineCapacity =
            linesBudget -
            linesUsedOnPage -
            (isFirstFragment ? marginLineCount(marginTopForFragment) : 0);
          let linesToPlace = Math.min(
            linesRemaining,
            visualLineCapacity,
            budgetLineCapacity,
          );

          if (
            linesToPlace < MIN_SPLIT_LINES &&
            linesRemaining > MIN_SPLIT_LINES
          ) {
            const advance = advanceToNextPage(
              layout,
              pageStartOffsetPt,
              contentOffsetPt,
            );

            if (isFirstFragment) {
              blockMarginTopPt = pageBreakMarginTop(
                advance,
                contentOffsetPt,
                advance.marginTopPt,
              );
              blockTopOffsetPt = advance.nextContentTopPt;
            } else {
              const splitLine = measurement.textLines[splitLineIndex - 1];

              pageStarts.push({
                textOffset: splitLine.endOffset,
                marginTopPt: pageBreakMarginTop(
                  advance,
                  contentOffsetPt,
                  advance.marginTopPt,
                ),
                topOffsetPt: advance.nextContentTopPt,
                linesBefore: splitLineIndex,
                linesAfter: linesRemaining,
              });
            }

            contentOffsetPt = advance.nextContentTopPt;
            pushBoundary(advance.boundaryOffsetPt);
            startBodyPage(advance.boundaryOffsetPt);
            continue;
          }

          if (
            linesRemaining > linesToPlace &&
            linesRemaining - linesToPlace < MIN_SPLIT_LINES
          ) {
            linesToPlace = linesRemaining - MIN_SPLIT_LINES;
          }

          if (linesToPlace <= 0) {
            break;
          }

          contentOffsetPt +=
            marginTopForFragment + linesToPlace * measurement.lineHeightPt;
          linesUsedOnPage +=
            linesToPlace +
            (isFirstFragment ? marginLineCount(marginTopForFragment) : 0);
          splitLineIndex += linesToPlace;
          isFirstFragment = false;

          if (splitLineIndex >= measurement.textLineCount) {
            contentOffsetPt += measurement.marginBottomPt;
            previousMarginBottomPt = measurement.marginBottomPt;
            placements.push({
              marginTopPt: blockMarginTopPt,
              topOffsetPt: blockTopOffsetPt,
              pageStarts: pageStarts.length > 0 ? pageStarts : undefined,
            });
            continue;
          }

          const advance = advanceToNextPage(
            layout,
            pageStartOffsetPt,
            contentOffsetPt,
          );
          const splitLine = measurement.textLines[splitLineIndex - 1];

          pageStarts.push({
            textOffset: splitLine.endOffset,
            marginTopPt: pageBreakMarginTop(
              advance,
              contentOffsetPt,
              advance.marginTopPt,
            ),
            topOffsetPt: advance.nextContentTopPt,
            linesBefore: splitLineIndex,
            linesAfter: measurement.textLineCount - splitLineIndex,
          });
          contentOffsetPt = advance.nextContentTopPt;
          pushBoundary(advance.boundaryOffsetPt);
          startBodyPage(advance.boundaryOffsetPt);
        }

        continue;
      }

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
