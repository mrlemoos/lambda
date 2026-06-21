import type { PageFormat, ScriptTypeface } from '@lambda/editor';
import type {
  BlockPlacement,
  PaginationResult,
  ScriptBlock,
  ScriptPage,
} from '@lambda/editor';

import {
  isPreviewVisibleBlock,
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
    fragments.push(text.slice(boundaries[index], boundaries[index + 1]));
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
  pageFormat,
  typeface,
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

        if (
          isContinuation &&
          fragmentIndex === 1 &&
          placement.splitDialogueCharacter
        ) {
          appendFragment(pages, bodyPageIndex, hasTitlePage, {
            elementType: 'splitDialogueCharacter',
            text: placement.splitDialogueCharacter.text,
            topOffsetPt: placement.splitDialogueCharacter.topOffsetPt,
            marginTopPt: placement.splitDialogueCharacter.marginTopPt,
          });
        }

        appendFragment(pages, bodyPageIndex, hasTitlePage, {
          elementType: block.type as PreviewFragment['elementType'],
          text,
          topOffsetPt,
          marginTopPt: isContinuation
            ? (pageStart?.marginTopPt ?? 0)
            : placement.marginTopPt,
        });
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
