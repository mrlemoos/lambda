import type { PageFormat } from '../ScriptEditor';
import { getPageLayout } from './pageLayout';
import { paginationLineWeight, visualHeightPt } from './lineWeight';
import type {
  PageBoundary,
  PaginationResult,
  ScriptBlock,
  ScriptPage,
} from './types';

export function paginateScript(
  blocks: ScriptBlock[],
  pageFormat: PageFormat = 'us-letter',
): PaginationResult {
  const layout = getPageLayout(pageFormat);
  const pages: ScriptPage[] = [];
  const boundaries: PageBoundary[] = [];
  let contentOffsetPt = 0;
  let pageStartOffsetPt = 0;
  let linesUsedOnPage = 0;
  let bodyPageNumber = 0;

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
  };

  const advanceToNextPage = () => {
    const boundaryOffsetPt = pageStartOffsetPt + layout.contentHeightPt;

    pushBoundary(boundaryOffsetPt);
    contentOffsetPt = Math.max(contentOffsetPt, boundaryOffsetPt);
    startBodyPage(boundaryOffsetPt);
  };

  const ensureFirstBodyPage = () => {
    if (bodyPageNumber === 0) {
      startBodyPage(contentOffsetPt);
    }
  };

  for (const block of blocks) {
    if (block.type === 'titlePage') {
      bodyPageNumber = 0;
      linesUsedOnPage = 0;
      pages.length = 0;
      boundaries.length = 0;
      pageStartOffsetPt = 0;
      contentOffsetPt = layout.contentHeightPt;
      pushBoundary(contentOffsetPt);
      continue;
    }

    if (block.type === 'pageBreak') {
      ensureFirstBodyPage();

      if (linesUsedOnPage > 0) {
        advanceToNextPage();
      }

      continue;
    }

    const visualHeight = visualHeightPt(block, layout);
    const paginationWeight = paginationLineWeight(block, layout);

    if (block.type === 'splitDialogueCharacter') {
      ensureFirstBodyPage();
      contentOffsetPt += visualHeight;
      continue;
    }

    if (paginationWeight === 0) {
      ensureFirstBodyPage();
      contentOffsetPt += visualHeight;
      continue;
    }

    ensureFirstBodyPage();

    if (
      linesUsedOnPage > 0 &&
      linesUsedOnPage + paginationWeight > layout.linesPerPage
    ) {
      advanceToNextPage();
    }

    linesUsedOnPage += paginationWeight;
    contentOffsetPt += visualHeight;

    if (linesUsedOnPage > layout.linesPerPage) {
      advanceToNextPage();
      linesUsedOnPage = paginationWeight;
    }
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
    totalHeightPt,
    pageFormat,
  };
}
