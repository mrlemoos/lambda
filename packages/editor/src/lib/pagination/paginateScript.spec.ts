import { describe, expect, it } from 'vitest';

import { measureBlock } from './elementMetrics';
import { getPageLayout, PAGE_TOP_GUTTER_PT } from './pageLayout';
import { paginateScript } from './paginateScript';
import type { ScriptBlock } from './types';

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

describe('paginateScript', () => {
  it('returns a single body page for a short script', () => {
    const blocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
      { type: 'action', text: 'Steam rises from the kettle.' },
    ];

    const result = paginateScript(blocks);

    expect(result.pages).toEqual([{ number: 1, topOffsetPt: 0 }]);
    expect(result.boundaries).toEqual([]);
  });

  it('starts body numbering at 1 after an unnumbered title page', () => {
    const blocks: ScriptBlock[] = [
      { type: 'titlePage', text: 'Title: TIME CHEF' },
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
    ];

    const result = paginateScript(blocks);

    expect(result.pages).toEqual([
      { number: 1, topOffsetPt: expect.any(Number) },
    ]);
    expect(result.pages[0].topOffsetPt).toBeGreaterThan(0);
    expect(result.boundaries).toHaveLength(1);
  });

  it('inserts a boundary before page 2 when body content exceeds one page', () => {
    const blocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...actionLines(50),
    ];

    const result = paginateScript(blocks);

    expect(result.pages.map((page) => page.number)).toEqual([1, 2]);
    expect(result.boundaries).toHaveLength(1);
  });

  it('does not advance screenplay line count for outline elements', () => {
    const blocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. ROOF - DAY' },
      ...actionLines(22),
      { type: 'synopsis', text: '= Beat A' },
      { type: 'synopsis', text: '= Beat B' },
      { type: 'action', text: 'Closing beat.' },
    ];

    const result = paginateScript(blocks);

    expect(result.pages).toEqual([{ number: 1, topOffsetPt: 0 }]);
  });

  it('counts outline text height toward page boundaries', () => {
    const beatText = (n: number) =>
      `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;
    const body: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 27 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
    ];
    const layout = getPageLayout('us-letter');
    const withoutOutline = paginateScript(body);
    const withOutline = paginateScript([
      { type: 'section', text: '# Act I' },
      { type: 'synopsis', text: '= Outline beats do not advance page count.' },
      ...body,
    ]);
    const beat16Text = beatText(26);
    const beat16WithoutIndex = body.findIndex(
      (block) => block.text === beat16Text,
    );
    const beat16WithIndex = [
      { type: 'section' as const, text: '# Act I' },
      {
        type: 'synopsis' as const,
        text: '= Outline beats do not advance page count.',
      },
      ...body,
    ].findIndex((block) => block.text === beat16Text);

    expect(withOutline.placements[beat16WithIndex].topOffsetPt).toBeGreaterThan(
      withoutOutline.placements[beat16WithoutIndex].topOffsetPt,
    );
    expect(
      withoutOutline.placements[beat16WithoutIndex].topOffsetPt,
    ).toBeLessThan(layout.contentHeightPt);
    expect(
      withOutline.placements[beat16WithIndex].topOffsetPt,
    ).toBeGreaterThanOrEqual(layout.contentHeightPt + PAGE_TOP_GUTTER_PT);
  });

  it('moves an outline block to the next page when it would cross a boundary', () => {
    const blocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...actionLines(42),
      { type: 'synopsis', text: '= This synopsis belongs on page two.' },
    ];
    const layout = getPageLayout('us-letter');
    const synopsisIndex = blocks.length - 1;

    const result = paginateScript(blocks);

    expect(result.placements[synopsisIndex].topOffsetPt).toBeGreaterThanOrEqual(
      layout.contentHeightPt + PAGE_TOP_GUTTER_PT,
    );
  });

  it('adds top margin so the first block on a new page clears the boundary', () => {
    const beatText = (n: number) =>
      `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;
    const blocks: ScriptBlock[] = [
      { type: 'section', text: '# Act I' },
      { type: 'synopsis', text: '= Outline beats do not advance page count.' },
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
    ];
    const layout = getPageLayout('us-letter');

    const result = paginateScript(blocks);
    const pageTwoStart = layout.contentHeightPt;
    const firstPageTwoBeatIndex = blocks.findIndex(
      (block) => block.text === beatText(26),
    );
    const firstOnPageTwo = result.placements.findIndex(
      (placement) => placement.topOffsetPt >= pageTwoStart,
    );

    expect(firstOnPageTwo).toBe(firstPageTwoBeatIndex);
    expect(
      result.placements[firstPageTwoBeatIndex].marginTopPt,
    ).toBeGreaterThan(0);
    expect(result.placements[firstPageTwoBeatIndex].topOffsetPt).toBe(
      pageTwoStart + PAGE_TOP_GUTTER_PT,
    );
  });

  it('does not straddle the page two boundary before the loading dock scene', () => {
    const beatText = (n: number) =>
      `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;
    const blocks: ScriptBlock[] = [
      { type: 'section', text: '# Act I' },
      { type: 'synopsis', text: '= Outline beats do not advance page count.' },
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 54 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
      { type: 'sceneHeading', text: 'EXT. LOADING DOCK - NIGHT' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 55),
      })),
    ];
    const layout = getPageLayout('us-letter');
    const secondBoundary = layout.contentHeightPt * 2;

    const result = paginateScript(blocks);
    const dockSceneIndex = blocks.findIndex(
      (block) => block.text === 'EXT. LOADING DOCK - NIGHT',
    );
    const dockBeatFourIndex = blocks.findIndex(
      (block) => block.text === beatText(58),
    );
    expect(result.placements[dockBeatFourIndex].topOffsetPt).toBeGreaterThan(
      result.placements[dockSceneIndex].topOffsetPt,
    );
    expect(
      result.placements[dockBeatFourIndex].topOffsetPt,
    ).toBeGreaterThanOrEqual(secondBoundary + PAGE_TOP_GUTTER_PT);

    let previousMarginBottomPt = 0;

    for (let index = 0; index < blocks.length; index += 1) {
      const measurement = measureBlock(
        blocks[index],
        layout,
        previousMarginBottomPt,
      );
      const placement = result.placements[index];
      const blockBottom = placement.topOffsetPt + measurement.heightPt;

      for (const boundary of result.boundaries) {
        if (placement.topOffsetPt < boundary.offsetPt) {
          expect(blockBottom).toBeLessThanOrEqual(boundary.offsetPt + 0.5);
        }
      }

      previousMarginBottomPt = measurement.marginBottomPt;
    }
  });

  it('keeps every block wholly above the first page boundary', () => {
    const beatText = (n: number) =>
      `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;
    const blocks: ScriptBlock[] = [
      { type: 'section', text: '# Act I' },
      { type: 'synopsis', text: '= Outline beats do not advance page count.' },
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
    ];
    const layout = getPageLayout('us-letter');

    const result = paginateScript(blocks);
    const firstBoundary = layout.contentHeightPt;
    const firstOnPageTwo = result.placements.findIndex(
      (placement) => placement.topOffsetPt >= firstBoundary,
    );

    let previousMarginBottomPt = 0;

    for (let index = 0; index < firstOnPageTwo; index += 1) {
      const measurement = measureBlock(
        blocks[index],
        layout,
        previousMarginBottomPt,
      );
      const placement = result.placements[index];
      const blockBottom = placement.topOffsetPt + measurement.heightPt;

      expect(blockBottom).toBeLessThanOrEqual(firstBoundary + 0.5);
      previousMarginBottomPt = measurement.marginBottomPt;
    }
  });

  it('honours a manual page break', () => {
    const blocks: ScriptBlock[] = [
      { type: 'action', text: 'Opening beat.' },
      { type: 'pageBreak', text: '===' },
      { type: 'sceneHeading', text: 'EXT. STREET - DAY' },
    ];

    const result = paginateScript(blocks);

    expect(result.pages.map((page) => page.number)).toEqual([1, 2]);
    expect(result.boundaries).toHaveLength(1);
  });

  it('splits long action across pages without orphaning either side', () => {
    const longAction = Array.from(
      { length: 12 },
      (_, index) =>
        `Long action segment ${index + 1} keeps moving through the corridor with enough words to wrap cleanly.`,
    ).join(' ');
    const blocks: ScriptBlock[] = [
      ...actionLines(25),
      { type: 'action', text: longAction },
    ];
    const layout = getPageLayout('us-letter');
    const longActionIndex = blocks.length - 1;

    const result = paginateScript(blocks);
    const split = result.placements[longActionIndex].pageStarts?.[0];

    expect(result.placements[longActionIndex].topOffsetPt).toBeLessThan(
      layout.contentHeightPt,
    );
    expect(split).toEqual(
      expect.objectContaining({
        textOffset: expect.any(Number),
        marginTopPt: expect.any(Number),
      }),
    );
    expect(split?.linesBefore).toBeGreaterThanOrEqual(2);
    expect(split?.linesAfter).toBeGreaterThanOrEqual(2);
  });

  it('moves a character cue, parenthetical, and first dialogue line together', () => {
    const blocks: ScriptBlock[] = [
      ...actionLines(27),
      { type: 'character', text: 'MARA' },
      { type: 'parenthetical', text: '(quietly)' },
      { type: 'dialogue', text: 'We go together.' },
    ];
    const layout = getPageLayout('us-letter');
    const characterIndex = blocks.findIndex(
      (block) => block.type === 'character',
    );

    const result = paginateScript(blocks);

    expect(
      result.placements[characterIndex].topOffsetPt,
    ).toBeGreaterThanOrEqual(layout.contentHeightPt + PAGE_TOP_GUTTER_PT);
  });

  it('moves a scene heading with the first line of its scene', () => {
    const blocks: ScriptBlock[] = [
      ...actionLines(27),
      { type: 'sceneHeading', text: 'INT. ATTIC - NIGHT' },
      { type: 'action', text: 'Dust lifts in the torch beam.' },
    ];
    const layout = getPageLayout('us-letter');
    const sceneHeadingIndex = blocks.findIndex(
      (block) => block.type === 'sceneHeading',
    );

    const result = paginateScript(blocks);

    expect(
      result.placements[sceneHeadingIndex].topOffsetPt,
    ).toBeGreaterThanOrEqual(layout.contentHeightPt + PAGE_TOP_GUTTER_PT);
  });

  it('moves a section header with its outline and first body line', () => {
    const blocks: ScriptBlock[] = [
      ...actionLines(27),
      { type: 'section', text: '# Act II' },
      { type: 'synopsis', text: '= The hunt turns inward.' },
      { type: 'action', text: 'A phone rings in the dark.' },
    ];
    const layout = getPageLayout('us-letter');
    const sectionIndex = blocks.findIndex((block) => block.type === 'section');

    const result = paginateScript(blocks);

    expect(result.placements[sectionIndex].topOffsetPt).toBeGreaterThanOrEqual(
      layout.contentHeightPt + PAGE_TOP_GUTTER_PT,
    );
  });

  it('splits long dialogue without leaving its character cue alone', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const blocks: ScriptBlock[] = [
      ...actionLines(19),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const layout = getPageLayout('us-letter');
    const characterIndex = blocks.findIndex(
      (block) => block.type === 'character',
    );
    const dialogueIndex = blocks.findIndex(
      (block) => block.type === 'dialogue',
    );

    const result = paginateScript(blocks);
    const split = result.placements[dialogueIndex].pageStarts?.[0];

    expect(result.placements[characterIndex].topOffsetPt).toBeLessThan(
      layout.contentHeightPt,
    );
    expect(result.placements[dialogueIndex].topOffsetPt).toBeLessThan(
      layout.contentHeightPt,
    );
    expect(split?.linesBefore).toBeGreaterThanOrEqual(2);
    expect(split?.linesAfter).toBeGreaterThanOrEqual(2);
  });

  it('keeps a transition with the previous beat', () => {
    const blocks: ScriptBlock[] = [
      ...actionLines(27),
      { type: 'action', text: 'She slams the door.' },
      { type: 'transition', text: 'CUT TO:' },
    ];
    const layout = getPageLayout('us-letter');
    const previousBeatIndex = blocks.findIndex(
      (block) => block.text === 'She slams the door.',
    );

    const result = paginateScript(blocks);

    expect(
      result.placements[previousBeatIndex].topOffsetPt,
    ).toBeGreaterThanOrEqual(layout.contentHeightPt + PAGE_TOP_GUTTER_PT);
  });
});
