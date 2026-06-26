import { getPageLayout } from '@lambda/editor';
import { describe, expect, it } from 'vitest';

import {
  naturalFragmentTopPt,
  resolveFlowFragmentTops,
  SPLIT_DIALOGUE_MORE_RESERVED_PT,
} from './resolveFlowFragmentTops';
import { formatPaginatedFragmentText } from './formatPaginatedFragmentText';
import type { PreviewFragment } from './previewTypes';

function fragment(
  overrides: Partial<PreviewFragment> &
    Pick<PreviewFragment, 'elementType' | 'text'>,
): PreviewFragment {
  return {
    topOffsetPt: 0,
    ...overrides,
  };
}

describe('resolveFlowFragmentTops', () => {
  it('returns natural tops when fragments do not collide', () => {
    const fragments: PreviewFragment[] = [
      fragment({ elementType: 'action', text: 'Line one.', topOffsetPt: 100 }),
      fragment({ elementType: 'action', text: 'Line two.', topOffsetPt: 112 }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );

    expect(layout.tops).toEqual([0, 12]);
    expect(layout.lineCounts).toEqual([1, 1]);
  });

  it('bumps a fragment down when it shares topOffsetPt with the previous one', () => {
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'splitDialogueCharacter',
        text: "MARA (CONT'D)",
        topOffsetPt: 200,
      }),
      fragment({
        elementType: 'dialogue',
        text: 'Continuation dialogue.',
        topOffsetPt: 200,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      200,
      'us-letter',
      'courier-prime',
    );

    expect(layout.tops[0]).toBe(0);
    expect(layout.tops[1]).toBe(12);
  });

  it('keeps capped dialogue at its pagination top when unobstructed', () => {
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'action',
        text: 'Action line.',
        topOffsetPt: 100,
      }),
      fragment({
        elementType: 'dialogue',
        text: 'People who pick this line of work got one option down the road.',
        topOffsetPt: 112,
        paginationLineCount: 2,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );

    expect(layout.tops[1]).toBe(12);
    expect(layout.lineCounts[1]).toBe(2);
  });

  it('keeps capped dialogue below preceding dialogue-cluster lines', () => {
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'character',
        text: 'RUSSELL',
        topOffsetPt: 100,
      }),
      fragment({
        elementType: 'parenthetical',
        text: '(chuckles, then...)',
        topOffsetPt: 112,
      }),
      fragment({
        elementType: 'dialogue',
        text: 'People who pick this line of work got one option down the road.',
        topOffsetPt: 112,
        paginationLineCount: 2,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );

    expect(layout.tops).toEqual([0, 12, 24]);
    expect(layout.lineCounts[2]).toBe(2);
  });

  it('keeps capped dialogue lines on split-dialogue pages', () => {
    const contentHeightPt = getPageLayout('us-letter').contentHeightPt;
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'character',
        text: 'RUSSELL',
        topOffsetPt: 100,
      }),
      fragment({
        elementType: 'parenthetical',
        text: '(chuckles, then...)',
        topOffsetPt: 112,
      }),
      fragment({
        elementType: 'dialogue',
        text: '"Sick." People who pick this line of work got one option down the road.',
        topOffsetPt: 112,
        paginationLineCount: 2,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );
    const lastLineBottom =
      (layout.tops[2] ?? 0) + (layout.lineCounts[2] ?? 0) * 12;

    expect(layout.lineCounts[2]).toBe(2);
    expect(lastLineBottom).toBeLessThanOrEqual(
      contentHeightPt - SPLIT_DIALOGUE_MORE_RESERVED_PT,
    );
  });

  it('trims only capped dialogue that would intrude on the (MORE) line', () => {
    const contentHeightPt = getPageLayout('us-letter').contentHeightPt;
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'dialogue',
        text: 'Word '.repeat(80),
        topOffsetPt: 100,
        paginationLineCount: 54,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );
    const lastLineBottom =
      (layout.tops[0] ?? 0) + (layout.lineCounts[0] ?? 0) * 12;

    expect(lastLineBottom).toBeLessThanOrEqual(
      contentHeightPt - SPLIT_DIALOGUE_MORE_RESERVED_PT,
    );
  });

  it('renders every dialogue line and flows following blocks down — never drops text', () => {
    const dialogueText =
      'Guillermo line 1 with enough words to wrap in the dialogue column. '.repeat(
        5,
      );
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'dialogue',
        text: dialogueText,
        topOffsetPt: 420,
      }),
      fragment({ elementType: 'character', text: 'RUSSELL', topOffsetPt: 600 }),
      fragment({
        elementType: 'parenthetical',
        text: '(chuckles, then...)',
        topOffsetPt: 612,
      }),
      fragment({
        elementType: 'dialogue',
        text: '"Sick." People who pick this line of work got one option down the road.',
        topOffsetPt: 624,
        paginationLineCount: 2,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      0,
      'us-letter',
      'courier-prime',
    );

    // The wrapping dialogue keeps all of its lines — no successor trims it.
    const wrappedLineCount = formatPaginatedFragmentText(
      dialogueText,
      'dialogue',
      'us-letter',
      'courier-prime',
    ).split('\n').length;
    expect(layout.lineCounts[0]).toBe(wrappedLineCount);

    // Following blocks flow below the dialogue's last line, never overlapping it.
    const dialogueBottom = layout.tops[0] + layout.lineCounts[0] * 12;
    expect(layout.tops[1]).toBeGreaterThanOrEqual(dialogueBottom);
    expect(layout.lineCounts[3]).toBeGreaterThan(0);
  });

  it('accounts for multi-line fragments when advancing the cursor', () => {
    const fragments: PreviewFragment[] = [
      fragment({
        elementType: 'dialogue',
        text: 'Word '.repeat(40),
        topOffsetPt: 100,
      }),
      fragment({
        elementType: 'character',
        text: 'MARA',
        topOffsetPt: 100,
      }),
    ];

    const layout = resolveFlowFragmentTops(
      fragments,
      100,
      'us-letter',
      'courier-prime',
    );

    expect(layout.tops[1]).toBeGreaterThan(layout.tops[0] ?? 0);
  });
});

describe('resolveFlowFragmentTops — no-overlap invariant', () => {
  const SCRIPT_LINE_HEIGHT_PT = 12;
  const longDialogue =
    '"Sick." People who pick this line of work got one option down the road: (a beat) Most people do not see the time to wind down, is all.';

  /** Render intervals for fragments that show at least one line. */
  function intervals(
    fragments: PreviewFragment[],
    base: number,
  ): [number, number][] {
    const { tops, lineCounts } = resolveFlowFragmentTops(
      fragments,
      base,
      'us-letter',
      'courier-prime',
    );

    return fragments
      .map((_, index): [number, number] => [
        tops[index],
        tops[index] + (lineCounts[index] ?? 0) * SCRIPT_LINE_HEIGHT_PT,
      ])
      .filter((_, index) => (lineCounts[index] ?? 0) > 0);
  }

  function hasOverlap(ivs: [number, number][]): boolean {
    for (let a = 0; a < ivs.length; a += 1) {
      for (let b = a + 1; b < ivs.length; b += 1) {
        if (ivs[a][0] < ivs[b][1] - 0.01 && ivs[b][0] < ivs[a][1] - 0.01) {
          return true;
        }
      }
    }
    return false;
  }

  // Reproduces the reported bug: a character cue, a parenthetical, and the
  // split dialogue it introduces, anchored near the bottom of the page where
  // the (MORE) reservation squeezes the dialogue's footer budget to zero.
  it('never overlaps a cue/parenthetical/split-dialogue cluster at any anchor', () => {
    for (let charTop = 0; charTop <= 700; charTop += 6) {
      for (const parenSharesCharTop of [false, true]) {
        for (const dialogueSharesParenTop of [false, true]) {
          for (
            let paginationLineCount = 1;
            paginationLineCount <= 4;
            paginationLineCount += 1
          ) {
            for (const base of [0, 12, charTop]) {
              const parenTop = parenSharesCharTop ? charTop : charTop + 12;
              const dialogueTop = dialogueSharesParenTop
                ? parenTop
                : parenTop + 12;
              const fragments: PreviewFragment[] = [
                fragment({
                  elementType: 'character',
                  text: 'RUSSELL',
                  topOffsetPt: charTop,
                }),
                fragment({
                  elementType: 'parenthetical',
                  text: '(chuckles, then...)',
                  topOffsetPt: parenTop,
                }),
                fragment({
                  elementType: 'dialogue',
                  text: longDialogue,
                  topOffsetPt: dialogueTop,
                  paginationLineCount,
                }),
                fragment({
                  elementType: 'splitDialogueMore',
                  text: '(MORE)',
                  topOffsetPt: dialogueTop,
                }),
              ];

              expect(
                hasOverlap(intervals(fragments, base)),
                `overlap at charTop=${charTop} base=${base} plc=${paginationLineCount}`,
              ).toBe(false);
            }
          }
        }
      }
    }
  });
});

describe('naturalFragmentTopPt', () => {
  it('includes marginTopPt on the first line only', () => {
    const top = naturalFragmentTopPt(
      fragment({
        elementType: 'dialogue',
        text: 'Hello.',
        topOffsetPt: 120,
        marginTopPt: 24,
      }),
      100,
    );

    expect(top).toBe(44);
  });
});
