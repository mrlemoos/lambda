import { describe, expect, it } from 'vitest';

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
      ...actionLines(52),
    ];

    const result = paginateScript(blocks);

    expect(result.pages.map((page) => page.number)).toEqual([1, 2]);
    expect(result.boundaries).toHaveLength(1);
  });

  it('does not advance pagination for outline elements', () => {
    const blocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. ROOF - DAY' },
      ...actionLines(24),
      { type: 'synopsis', text: '= Beat A' },
      { type: 'synopsis', text: '= Beat B' },
      { type: 'action', text: 'Closing beat.' },
    ];

    const result = paginateScript(blocks);

    expect(result.pages).toEqual([{ number: 1, topOffsetPt: 0 }]);
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
