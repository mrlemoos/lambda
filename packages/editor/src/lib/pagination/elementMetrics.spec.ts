import { describe, expect, it } from 'vitest';

import { ELEMENT_METRICS, measureBlock, wrapTextLines } from './elementMetrics';
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

  it('does not add automatic vertical margins to outline elements', () => {
    expect(ELEMENT_METRICS.section.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.section.marginBottomPt).toBe(0);
    expect(ELEMENT_METRICS.synopsis.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.synopsis.marginBottomPt).toBe(0);
    expect(ELEMENT_METRICS.note.marginTopPt).toBe(0);
    expect(ELEMENT_METRICS.note.marginBottomPt).toBe(0);
  });

  it('measures empty action blocks as typed blank lines', () => {
    const layout = getPageLayout('us-letter');
    const block = { type: 'action' as const, text: '' };

    const measurement = measureBlock(block, layout, 0);

    expect(measurement.heightPt).toBe(ELEMENT_METRICS.action.lineHeightPt);
    expect(measurement.paginationLines).toBe(1);
  });

  it('measures blocks with each supported screenplay typeface', () => {
    const layout = getPageLayout('us-letter');
    const block = { type: 'action' as const, text: 'Hello world.' };

    for (const typeface of [
      'courier-prime',
      'courier-new',
      'monospace',
    ] as const) {
      const measurement = measureBlock(block, layout, 0, typeface);

      expect(measurement.paginationLines).toBeGreaterThan(0);
    }
  });

  it('wraps dialogue using border-box max-width minus left padding', () => {
    const layout = getPageLayout('us-letter');
    const oneLine = { type: 'dialogue' as const, text: 'A'.repeat(26) };
    const twoLines = { type: 'dialogue' as const, text: 'A'.repeat(27) };

    expect(measureBlock(oneLine, layout, 0).textLineCount).toBe(1);
    expect(measureBlock(twoLines, layout, 0).textLineCount).toBe(2);
  });

  it('wraps text at word boundaries instead of splitting words', () => {
    const charsPerLineCount = 26;
    const text = 'when the boss finds out you let him die';

    const lines = wrapTextLines(text, charsPerLineCount);

    expect(lines).toEqual([
      { startOffset: 0, endOffset: 23 },
      { startOffset: 24, endOffset: text.length },
    ]);
    expect(text.slice(lines[0].startOffset, lines[0].endOffset)).toBe(
      'when the boss finds out',
    );
    expect(text.slice(lines[1].startOffset, lines[1].endOffset)).toBe(
      'you let him die',
    );
  });

  it('predicts a page break using typed block heights instead of outline margins', () => {
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

    const firstOverflowingBeatIndex = blocks.findIndex(
      (block) => block.text === beatText(26),
    );

    expect(firstBreakBeat).toBe(firstOverflowingBeatIndex);
  });
});
