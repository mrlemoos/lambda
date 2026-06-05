import { describe, expect, it } from 'vitest';

import { measureBlock } from './elementMetrics';
import { getPageLayout } from './pageLayout';

const beatText = (n: number) =>
  `Beat ${n}. The camera holds on the warehouse — dust, silence, then movement.`;

describe('measureBlock', () => {
  it('collapses adjacent vertical margins between action blocks', () => {
    const layout = getPageLayout('us-letter');
    const block = { type: 'action' as const, text: 'Steam rises.' };

    const first = measureBlock(block, layout, 0);
    const second = measureBlock(block, layout, first.marginBottomPt);

    expect(second.heightPt).toBeLessThan(first.heightPt * 2);
    expect(second.heightPt).toBe(first.heightPt);
  });

  it('predicts a page break before beat 16 in the multi-page story opener', () => {
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
      (block) => block.text === beatText(16),
    );

    expect(firstBreakBeat).toBe(beatBlockIndex);
  });
});
