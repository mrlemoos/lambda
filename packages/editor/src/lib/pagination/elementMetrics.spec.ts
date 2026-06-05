import { describe, expect, it } from 'vitest';

import { ELEMENT_METRICS, measureBlock } from './elementMetrics';
import { getPageLayout } from './pageLayout';

const beatText = (n: number) =>
  `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;

describe('measureBlock', () => {
  it('does not add automatic vertical margins to screenplay body elements', () => {
    expect(ELEMENT_METRICS.action.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.action.marginBottomPt).toBe(0);
    expect(ELEMENT_METRICS.centeredText.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.sceneHeading.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.sceneHeading.marginBottomPt).toBe(0);
    expect(ELEMENT_METRICS.character.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.character.lineHeightPt).toBe(
      ELEMENT_METRICS.action.lineHeightPt,
    );
    expect(ELEMENT_METRICS.transition.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.transition.marginBottomPt).toBe(0);
  });

  it('measures empty action blocks as typed blank lines', () => {
    const layout = getPageLayout('us-letter');
    const block = { type: 'action' as const, text: '' };

    const measurement = measureBlock(block, layout, 0);

    expect(measurement.heightPt).toBe(ELEMENT_METRICS.action.lineHeightPt);
    expect(measurement.paginationLines).toBe(1);
  });

  it('predicts a page break using typed blank lines instead of body margins', () => {
    const layout = getPageLayout('us-letter');
    const blocks = [
      { type: 'section' as const, text: '# Act I' },
      {
        type: 'synopsis' as const,
        text: '= Outline beats do not advance page count.',
      },
      { type: 'sceneHeading' as const, text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'action' as const,
        text: beatText(index + 1),
      })),
    ];

    let previousMarginBottomPt = 0;
    let offsetPt = 0;
    let firstBreakBeat: number | null = null;

    for (let index = 0; index < blocks.length; index += 1) {
      const measurement = measureBlock(
        blocks[index],
        layout,
        previousMarginBottomPt,
      );
      const bottom = layout.contentHeightPt;

      if (
        firstBreakBeat === null &&
        offsetPt > 0 &&
        offsetPt + measurement.heightPt > bottom
      ) {
        firstBreakBeat = index;
      }

      offsetPt += measurement.heightPt;
      previousMarginBottomPt = measurement.marginBottomPt;
    }

    const beatBlockIndex = blocks.findIndex(
      (block) => block.text === beatText(25),
    );

    expect(firstBreakBeat).toBe(beatBlockIndex);
  });
});
