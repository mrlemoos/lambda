import { describe, expect, it } from 'vitest';

import { measureBlock } from './elementMetrics';
import { getPageLayout, PAGE_TOP_GUTTER_PT } from './pageLayout';
import { paginateScript } from './paginateScript';
import type { ScriptBlock } from './types';

function actionLines(count: number): ScriptBlock[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'action' as const,
    text: `Action line ${index + 1}.`,
  }));
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

  it('counts outline height and margins toward page boundaries', () => {
    const beatText = (n: number) =>
      `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;
    const body: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 16 }, (_, index) => ({
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
    const beat16Text = beatText(16);
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
    const beat16Index = blocks.findIndex(
      (block) => block.text === beatText(16),
    );
    const firstOnPageTwo = result.placements.findIndex(
      (placement) => placement.topOffsetPt >= pageTwoStart,
    );

    expect(firstOnPageTwo).toBe(beat16Index);
    expect(result.placements[beat16Index].marginTopPt).toBeGreaterThan(0);
    expect(result.placements[beat16Index].topOffsetPt).toBe(
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
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
      { type: 'sceneHeading', text: 'EXT. LOADING DOCK - NIGHT' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 29),
      })),
    ];
    const layout = getPageLayout('us-letter');
    const secondBoundary = layout.contentHeightPt * 2;

    const result = paginateScript(blocks);
    const dockSceneIndex = blocks.findIndex(
      (block) => block.text === 'EXT. LOADING DOCK - NIGHT',
    );
    const dockBeatFourIndex = blocks.findIndex(
      (block) => block.text === beatText(32),
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
});
