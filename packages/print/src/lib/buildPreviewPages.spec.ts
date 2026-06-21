import {
  collapseEnrichedPlacements,
  enrichBlocks,
  paginateScript,
  titlePageBlocks,
  type PageFormat,
  type PaginationResult,
  type ScriptBlock,
  type ScriptTypeface,
} from '@lambda/editor';
import { describe, expect, it } from 'vitest';

import { buildPreviewPages } from './buildPreviewPages';

function paginateForPreview(
  bodyBlocks: ScriptBlock[],
  pageFormat: PageFormat = 'us-letter',
  typeface: ScriptTypeface = 'courier-prime',
  titlePageLines: string[] = [],
): { blocks: ScriptBlock[]; pagination: PaginationResult } {
  const blocks = [...titlePageBlocks(titlePageLines), ...bodyBlocks];
  const firstPass = paginateScript(blocks, pageFormat, typeface);
  const enrichedBlocks = enrichBlocks(blocks, firstPass);
  const secondPass = paginateScript(enrichedBlocks, pageFormat, typeface);
  const placements = collapseEnrichedPlacements(
    enrichedBlocks,
    secondPass.placements,
  );

  return {
    blocks: enrichedBlocks.filter(
      (block) => block.type !== 'splitDialogueCharacter',
    ),
    pagination: {
      ...secondPass,
      placements,
      hasTitlePage: titlePageLines.length > 0,
    },
  };
}

function actionLines(count: number): ScriptBlock[] {
  return Array.from({ length: count }, (_, index) => [
    {
      type: 'action' as const,
      text: `Action line ${index + 1}.`,
    },
    {
      type: 'action' as const,
      text: '',
    },
  ]).flat();
}

describe('buildPreviewPages', () => {
  it('slices action text at pageStarts text offsets', () => {
    const longAction = Array.from(
      { length: 40 },
      (_, index) =>
        `Action segment ${index + 1} carries enough words to wrap across the full action column width.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [{ type: 'action', text: longAction }];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const actionIndex = blocks.findIndex((block) => block.type === 'action');
    const pageStarts = pagination.placements[actionIndex]?.pageStarts;

    expect(pageStarts?.length).toBeGreaterThan(0);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const bodyPages = result.pages.filter((page) => page.kind === 'body');
    const actionFragments = bodyPages.flatMap((page) =>
      page.fragments.filter((fragment) => fragment.elementType === 'action'),
    );

    expect(actionFragments).toHaveLength(2);
    expect(actionFragments[0].text + actionFragments[1].text).toBe(longAction);
    expect(actionFragments[0].text.length).toBe(pageStarts?.[0]?.textOffset);
  });

  it('omits outline elements from preview output', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'section', text: 'Act One' },
      { type: 'synopsis', text: 'Hero arrives.' },
      { type: 'note', text: 'Todo: tighten beat.' },
      { type: 'action', text: 'Visible action.' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const allFragments = result.pages.flatMap((page) => page.fragments);

    expect(allFragments).toEqual([
      expect.objectContaining({
        elementType: 'action',
        text: 'Visible action.',
      }),
    ]);
  });

  it('assigns topOffsetPt from pagination placements to preview fragments', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
      { type: 'action', text: 'Steam rises from the kettle.' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const sceneIndex = blocks.findIndex(
      (block) => block.type === 'sceneHeading',
    );
    const actionIndex = blocks.findIndex((block) => block.type === 'action');

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const bodyPage = result.pages.find((page) => page.kind === 'body');

    expect(bodyPage?.fragments[0]).toMatchObject({
      elementType: 'sceneHeading',
      topOffsetPt: pagination.placements[sceneIndex]?.topOffsetPt,
    });
    expect(bodyPage?.fragments[1]).toMatchObject({
      elementType: 'action',
      topOffsetPt: pagination.placements[actionIndex]?.topOffsetPt,
    });
    expect(bodyPage?.fragments[1]?.topOffsetPt).toBeGreaterThan(
      bodyPage?.fragments[0]?.topOffsetPt ?? 0,
    );
  });

  it('renders split dialogue character on the continuation page', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...actionLines(19),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const dialogueIndex = blocks.findIndex(
      (block) => block.type === 'dialogue',
    );
    const pageStarts = pagination.placements[dialogueIndex]?.pageStarts;
    const splitCue =
      pagination.placements[dialogueIndex]?.splitDialogueCharacter;
    const continuationOffset = pageStarts?.[0]?.textOffset ?? 0;

    expect(splitCue).toBeDefined();
    expect(pageStarts?.length).toBeGreaterThan(0);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const bodyPages = result.pages.filter((page) => page.kind === 'body');
    const continuationPage = bodyPages.find((page) =>
      page.fragments.some(
        (fragment) => fragment.elementType === 'splitDialogueCharacter',
      ),
    );
    const continuationFragments = continuationPage?.fragments ?? [];

    expect(continuationFragments[0]).toMatchObject({
      elementType: 'splitDialogueCharacter',
      text: "MARA (CONT'D)",
    });
    expect(continuationFragments[1]?.elementType).toBe('dialogue');
    expect(continuationFragments[1]?.text).toBe(
      longDialogue.slice(continuationOffset),
    );
  });

  it('keeps distinct topOffsetPt for consecutive blocks on the same preview page', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. PORCH - NIGHT' },
      { type: 'action', text: 'Guillermo pulls his gun out.' },
      { type: 'character', text: 'MARIO' },
      { type: 'dialogue', text: 'Careful.' },
      { type: 'action', text: 'Russell COUGHS, harshly.' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const bodyPage = result.pages.find((page) => page.kind === 'body');
    const tops =
      bodyPage?.fragments.map((fragment) => fragment.topOffsetPt) ?? [];

    expect(new Set(tops).size).toBe(tops.length);
    for (let index = 1; index < tops.length; index += 1) {
      expect(tops[index]).toBeGreaterThan(tops[index - 1]);
    }
  });

  it('assigns pagination marginTopPt after split dialogue enrichment', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...actionLines(19),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const continuationPage = result.pages
      .filter((page) => page.kind === 'body')
      .find((page) =>
        page.fragments.some(
          (fragment) => fragment.elementType === 'splitDialogueCharacter',
        ),
      );
    const cueIndex =
      continuationPage?.fragments.findIndex(
        (fragment) => fragment.elementType === 'splitDialogueCharacter',
      ) ?? -1;
    const dialogueIndex =
      continuationPage?.fragments.findIndex(
        (fragment, index) =>
          fragment.elementType === 'dialogue' && index > cueIndex,
      ) ?? -1;

    expect(cueIndex).toBeGreaterThanOrEqual(0);
    expect(dialogueIndex).toBeGreaterThan(cueIndex);
    expect(continuationPage?.fragments[dialogueIndex]?.marginTopPt).toBe(12);
  });

  it('numbers body pages from one without a title sheet', () => {
    const bodyBlocks: ScriptBlock[] = [{ type: 'action', text: 'Hello.' }];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });

    expect(result.hasTitlePage).toBe(false);
    expect(result.pages.map((page) => page.pageNumber)).toEqual([1]);
  });

  it('prepends an unnumbered title sheet when titlePageLines are present', () => {
    const bodyBlocks: ScriptBlock[] = [{ type: 'action', text: 'Hello.' }];
    const titlePageLines = ['Title: MY SCRIPT', 'Author: Jane Doe'];
    const { blocks, pagination } = paginateForPreview(
      bodyBlocks,
      'us-letter',
      'courier-prime',
      titlePageLines,
    );

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines,
    });

    expect(result.hasTitlePage).toBe(true);
    expect(result.pages[0]).toMatchObject({ kind: 'title' });
    expect(result.pages[0].pageNumber).toBeUndefined();
    expect(result.pages[1]?.pageNumber).toBe(1);
  });
});
