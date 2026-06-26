import {
  collapseEnrichedPlacements,
  enrichBlocks,
  getPageLayout,
  paginateScript,
  titlePageBlocks,
  type PageFormat,
  type PaginationResult,
  type ScriptBlock,
  type ScriptTypeface,
} from '@lambda/editor';
import { describe, expect, it } from 'vitest';

import { buildPreviewPages } from './buildPreviewPages';
import { resolveFlowFragmentTops } from './resolveFlowFragmentTops';

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

function isMidWordSplit(text: string, offset: number): boolean {
  if (offset <= 0 || offset >= text.length) {
    return false;
  }

  const before = text[offset - 1];
  const after = text[offset];

  return /[A-Za-z0-9]/.test(before) && /[A-Za-z0-9]/.test(after);
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
    // Split lands on a space (line boundary); rejoining with it restores the text.
    expect(`${actionFragments[0].text} ${actionFragments[1].text}`).toBe(
      longAction,
    );
    expect(actionFragments[0].text.length).toBe(pageStarts?.[0]?.textOffset);
  });

  it('does not split dialogue mid-word at page breaks', () => {
    const dialogue = [
      ...Array.from(
        { length: 12 },
        (_, index) =>
          `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
      ),
      "what happens when the boss finds out you let him die? You're not gonna shoot me.",
    ].join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...actionLines(19),
      { type: 'action', text: '-- Mario whips out his gun at Guillermo.' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: dialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const dialogueIndex = blocks.findIndex(
      (block) => block.type === 'dialogue',
    );
    const pageStarts = pagination.placements[dialogueIndex]?.pageStarts;

    expect(pageStarts?.length).toBeGreaterThan(0);

    for (const pageStart of pageStarts ?? []) {
      expect(isMidWordSplit(dialogue, pageStart.textOffset)).toBe(false);
    }

    const result = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const dialogueFragments = result.pages
      .flatMap((page) => page.fragments)
      .filter((fragment) => fragment.elementType === 'dialogue');

    expect(dialogueFragments.length).toBeGreaterThan(1);
    // Each split lands on a space; rejoining the fragments with one restores
    // the dialogue verbatim — no word is dropped or run together.
    expect(dialogueFragments.map((fragment) => fragment.text).join(' ')).toBe(
      dialogue,
    );
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
    // Continuation begins at the first word, not the space the split landed on.
    expect(continuationFragments[1]?.text).toBe(
      longDialogue.slice(continuationOffset).replace(/^[^\S\n]+/, ''),
    );

    const splitPage = bodyPages.find((page) =>
      page.fragments.some(
        (fragment) => fragment.elementType === 'splitDialogueMore',
      ),
    );

    expect(splitPage?.fragments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          elementType: 'splitDialogueMore',
          text: '(MORE)',
        }),
      ]),
    );
    expect(
      bodyPages
        .find((page) =>
          page.fragments.some(
            (fragment) => fragment.elementType === 'splitDialogueCharacter',
          ),
        )
        ?.fragments.some(
          (fragment) => fragment.elementType === 'splitDialogueMore',
        ),
    ).toBe(false);
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
    const dialogueBlockIndex = blocks.findIndex(
      (block) => block.type === 'dialogue',
    );
    const continuationMarginTopPt =
      pagination.placements[dialogueBlockIndex]?.pageStarts?.[0]?.marginTopPt;

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
    expect(continuationMarginTopPt).toBeDefined();
    expect(continuationPage?.fragments[dialogueIndex]?.marginTopPt).toBe(
      continuationMarginTopPt,
    );
  });

  it('places dialogue lines before (MORE) on the same preview page', () => {
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
    const preview = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const morePage = preview.pages.find((page) =>
      page.fragments.some(
        (fragment) => fragment.elementType === 'splitDialogueMore',
      ),
    );
    const dialogueBeforeMore =
      morePage?.fragments.filter(
        (fragment) => fragment.elementType === 'dialogue',
      ) ?? [];

    expect(morePage).toBeDefined();
    expect(dialogueBeforeMore.length).toBeGreaterThan(0);
    expect(dialogueBeforeMore[0]?.text.length).toBeGreaterThan(0);
    expect(dialogueBeforeMore[0]?.paginationLineCount).toBeGreaterThan(0);
  });

  it('shows russell dialogue before (MORE) on a tight page', () => {
    const guillermo =
      "Son. Woods senior died a couple of years ago. Fitz's been working in his place since the old man got sick.";
    const russell =
      '"Sick." People who pick this line of work got one option down the road: (a beat) Most people don\'t see the time to wind down, is all.';
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...actionLines(47),
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: guillermo },
      { type: 'character', text: 'RUSSELL' },
      { type: 'parenthetical', text: '(chuckles, then...)' },
      { type: 'dialogue', text: russell },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const preview = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const morePage = preview.pages.find((page) =>
      page.fragments.some(
        (fragment) => fragment.elementType === 'splitDialogueMore',
      ),
    );
    const flow = morePage?.fragments ?? [];
    const flowLayout = resolveFlowFragmentTops(
      flow,
      morePage?.contentTopOffsetPt ?? 0,
      'us-letter',
      'courier-prime',
    );
    const russellDialogueIdx = flow.findIndex(
      (fragment) =>
        fragment.elementType === 'dialogue' &&
        fragment.paginationLineCount !== undefined &&
        fragment.text.startsWith('"Sick."'),
    );
    const contentHeight = getPageLayout('us-letter').contentHeightPt;

    expect(russellDialogueIdx).toBeGreaterThanOrEqual(0);
    expect(flowLayout.lineCounts[russellDialogueIdx]).toBeGreaterThan(0);
    expect(
      (flowLayout.tops[russellDialogueIdx] ?? 0) +
        (flowLayout.lineCounts[russellDialogueIdx] ?? 0) * 12,
    ).toBeLessThanOrEqual(contentHeight - 12);
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
