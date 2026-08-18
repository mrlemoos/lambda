import type { PageFormat, ScriptTypeface } from '@lambda/editor';
import type {
  BlockPlacement,
  PaginationResult,
  ScriptBlock,
  ScriptPage,
} from '@lambda/editor';

import {
  isPreviewVisibleBlock,
  SPLIT_DIALOGUE_MORE_ANNOTATION,
  type PreviewFragment,
  type PreviewPage,
  type PreviewPagesModel,
} from './previewTypes';

export type BuildPreviewPagesInput = {
  blocks: ScriptBlock[];
  pagination: PaginationResult;
  pageFormat: PageFormat;
  typeface: ScriptTypeface;
  titlePageLines: string[];
};

function resolveBodyPageIndex(
  topOffsetPt: number,
  bodyPages: ScriptPage[],
): number {
  let pageIndex = 0;

  for (let index = 0; index < bodyPages.length; index += 1) {
    if (bodyPages[index].topOffsetPt <= topOffsetPt) {
      pageIndex = index;
    } else {
      break;
    }
  }

  return pageIndex;
}

function sliceBlockText(
  text: string,
  pageStarts: NonNullable<BlockPlacement['pageStarts']>,
): string[] {
  const splitOffsets = pageStarts.map((pageStart) => pageStart.textOffset);
  const boundaries = [0, ...splitOffsets, text.length];
  const fragments: string[] = [];

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const slice = text.slice(boundaries[index], boundaries[index + 1]);
    // A split lands on the space between words; continuation fragments would
    // otherwise begin with that space, indenting the line and shifting its wrap
    // away from how the editor renders the same text.
    fragments.push(index === 0 ? slice : slice.replace(/^[^\S\n]+/, ''));
  }

  return fragments;
}

function appendFragment(
  pages: PreviewPage[],
  bodyPageIndex: number,
  hasTitlePage: boolean,
  fragment: PreviewFragment,
): void {
  const previewPageIndex = bodyPageIndex + (hasTitlePage ? 1 : 0);
  pages[previewPageIndex].fragments.push(fragment);
}

function linesOnPageBeforeSplit(
  pageStarts: NonNullable<BlockPlacement['pageStarts']>,
  fragmentIndex: number,
): number {
  if (fragmentIndex === 0) {
    return pageStarts[0]?.linesBefore ?? 0;
  }

  const current = pageStarts[fragmentIndex];
  const previous = pageStarts[fragmentIndex - 1];

  return current.linesBefore - previous.linesBefore;
}

function buildBodyPages(pagination: PaginationResult): PreviewPage[] {
  return pagination.pages.map((page) => ({
    kind: 'body' as const,
    pageNumber: page.number,
    contentTopOffsetPt: page.topOffsetPt,
    fragments: [],
  }));
}

export function buildPreviewPages({
  blocks,
  pagination,
  titlePageLines,
}: BuildPreviewPagesInput): PreviewPagesModel {
  const hasTitlePage = titlePageLines.length > 0;
  const pages: PreviewPage[] = hasTitlePage
    ? [{ kind: 'title', fragments: [] }, ...buildBodyPages(pagination)]
    : buildBodyPages(pagination);
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];

    if (!isPreviewVisibleBlock(block)) {
      continue;
    }

    const placement = pagination.placements[blockIndex];

    if (!placement) {
      continue;
    }

    if (placement.pageStarts && placement.pageStarts.length > 0) {
      const textFragments = sliceBlockText(block.text, placement.pageStarts);
      let moreBodyPageIndex: number | undefined;

      textFragments.forEach((text, fragmentIndex) => {
        if (text.length === 0) {
          return;
        }

        const isContinuation = fragmentIndex > 0;
        const pageStart = isContinuation
          ? placement.pageStarts?.[fragmentIndex - 1]
          : undefined;
        const topOffsetPt = isContinuation
          ? (pageStart?.topOffsetPt ?? placement.topOffsetPt)
          : placement.topOffsetPt;
        const bodyPageIndex = resolveBodyPageIndex(
          topOffsetPt,
          pagination.pages,
        );
        let targetBodyPageIndex = bodyPageIndex;

        if (
          isContinuation &&
          moreBodyPageIndex !== undefined &&
          targetBodyPageIndex <= moreBodyPageIndex
        ) {
          targetBodyPageIndex = moreBodyPageIndex + 1;
        }

        if (
          isContinuation &&
          fragmentIndex === 1 &&
          placement.splitDialogueCharacter
        ) {
          appendFragment(pages, targetBodyPageIndex, hasTitlePage, {
            elementType: 'splitDialogueCharacter',
            text: placement.splitDialogueCharacter.text,
            topOffsetPt: placement.splitDialogueCharacter.topOffsetPt,
            marginTopPt: placement.splitDialogueCharacter.marginTopPt,
          });
        }

        appendFragment(pages, targetBodyPageIndex, hasTitlePage, {
          elementType: block.type as PreviewFragment['elementType'],
          text,
          topOffsetPt,
          marginTopPt: isContinuation
            ? (pageStart?.marginTopPt ?? 0)
            : placement.marginTopPt,
          paginationLineCount:
            block.type === 'dialogue' &&
            fragmentIndex < textFragments.length - 1 &&
            placement.pageStarts
              ? linesOnPageBeforeSplit(placement.pageStarts, fragmentIndex)
              : undefined,
        });

        if (
          block.type === 'dialogue' &&
          fragmentIndex < textFragments.length - 1
        ) {
          moreBodyPageIndex = targetBodyPageIndex;
          appendFragment(pages, targetBodyPageIndex, hasTitlePage, {
            elementType: 'splitDialogueMore',
            text: SPLIT_DIALOGUE_MORE_ANNOTATION,
            topOffsetPt,
          });
        }
      });

      continue;
    }

    const bodyPageIndex = resolveBodyPageIndex(
      placement.topOffsetPt,
      pagination.pages,
    );

    appendFragment(pages, bodyPageIndex, hasTitlePage, {
      elementType: block.type as PreviewFragment['elementType'],
      text: block.text,
      topOffsetPt: placement.topOffsetPt,
      marginTopPt: placement.marginTopPt,
    });
  }

  return {
    pages,
    hasTitlePage,
  };
}
