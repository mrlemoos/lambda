import { render } from '@testing-library/react';
import {
  getPageLayout,
  paginateSessionDocument,
  type PageFormat,
  type ScriptTypeface,
} from '@lambda/editor';
import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';

import { ScriptPreviewView } from './ScriptPreviewView';

const SCRIPT_LINE_HEIGHT_PT = 12;

type Block = { type: string; text: string };

/** Build a TipTap-shaped document the serializer understands (maps on node.type). */
function documentFrom(blocks: Block[]): JSONContent {
  return {
    type: 'doc',
    content: blocks.map((block) => ({
      type: block.type,
      content: block.text ? [{ type: 'text', text: block.text }] : [],
    })),
  };
}

function renderScript(
  blocks: Block[],
  titlePageLines: string[] = [],
  pageFormat: PageFormat = 'us-letter',
  typeface: ScriptTypeface = 'courier-prime',
) {
  const { blocks: previewBlocks, pagination } = paginateSessionDocument({
    document: documentFrom(blocks),
    titlePageLines,
    pageFormat,
    typeface,
  });

  return render(
    <ScriptPreviewView
      blocks={previewBlocks}
      pagination={pagination}
      pageFormat={pageFormat}
      typeface={typeface}
      titlePageLines={titlePageLines}
    />,
  );
}

type RenderedLine = {
  top: number;
  bottom: number;
  className: string;
  text: string;
};

function pageLines(page: Element): RenderedLine[] {
  return [...page.querySelectorAll('.script-preview-page-body > p')].map(
    (el) => {
      const top = parseFloat((el as HTMLElement).style.top || '0');
      return {
        top,
        bottom: top + SCRIPT_LINE_HEIGHT_PT,
        className: el.className.split(' ')[0],
        text: el.textContent ?? '',
      };
    },
  );
}

/** Two single-line rows overlap when their tops are less than one line apart. */
function findOverlap(
  lines: RenderedLine[],
): [RenderedLine, RenderedLine] | undefined {
  const sorted = [...lines].sort((a, b) => a.top - b.top);
  for (let index = 1; index < sorted.length; index += 1) {
    if (
      sorted[index].top - sorted[index - 1].top <
      SCRIPT_LINE_HEIGHT_PT - 0.01
    ) {
      return [sorted[index - 1], sorted[index]];
    }
  }
  return undefined;
}

const PARENTHETICAL = '(chuckles, then...)';
const RUSSELL_DIALOGUE =
  '"Sick." People who pick this line of work got one option down the road: (a beat) Most people don\'t see the time to wind down, is all.';
const LONG_DIALOGUE = Array.from(
  { length: 12 },
  (_, index) =>
    `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
).join(' ');

describe('preview layout invariants', () => {
  // The split happens at different points depending on how much fills the page
  // above the dialogue cluster, so sweep the boundary alignment.
  const dialogues = [
    { id: 'russell', text: RUSSELL_DIALOGUE },
    { id: 'long', text: LONG_DIALOGUE },
  ];

  for (const dialogue of dialogues) {
    for (const withTitle of [false, true]) {
      for (let actionLines = 40; actionLines <= 56; actionLines += 1) {
        it(`never overlaps lines (${dialogue.id}, title=${withTitle}, n=${actionLines})`, () => {
          const blocks: Block[] = [
            { type: 'sceneHeading', text: 'INT. CAR - DAY' },
            ...Array.from({ length: actionLines }, (_, index) => ({
              type: 'action',
              text: `Action line ${index + 1}.`,
            })),
            { type: 'character', text: 'RUSSELL' },
            { type: 'parenthetical', text: PARENTHETICAL },
            { type: 'dialogue', text: dialogue.text },
          ];
          const { container } = renderScript(
            blocks,
            withTitle ? ['Title: MY SCRIPT'] : [],
          );

          for (const page of container.querySelectorAll(
            '.script-preview-page',
          )) {
            const lines = pageLines(page);
            const overlap = findOverlap(lines);

            expect(
              overlap,
              overlap
                ? `overlap: ${JSON.stringify(overlap)} on page ${page.querySelector('.script-preview-page-number')?.textContent}`
                : undefined,
            ).toBeUndefined();
          }
        });
      }
    }
  }

  // A split dialogue must reappear in full across the page break — every
  // character of every dialogue block has to survive pagination + rendering.
  for (let actionLines = 44; actionLines <= 56; actionLines += 1) {
    it(`never drops dialogue text across a split (n=${actionLines})`, () => {
      const dialogueOne =
        '"Sick." People who pick this line of work got one option down the road: retirement.';
      const dialogueTwo =
        "Most people don't see the time to wind down, is all.";
      const blocks: Block[] = [
        { type: 'sceneHeading', text: 'INT. CAR - DAY' },
        ...Array.from({ length: actionLines }, (_, index) => ({
          type: 'action',
          text: `Action line ${index + 1}.`,
        })),
        { type: 'character', text: 'RUSSELL' },
        { type: 'parenthetical', text: PARENTHETICAL },
        { type: 'dialogue', text: dialogueOne },
        { type: 'parenthetical', text: '(a beat)' },
        { type: 'dialogue', text: dialogueTwo },
      ];
      const { container } = renderScript(blocks);

      const renderedDialogue = [
        ...container.querySelectorAll('.script-preview-page-body > p.dialogue'),
      ]
        .map((el) => el.textContent ?? '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      const expected = `${dialogueOne} ${dialogueTwo}`
        .replace(/\s+/g, ' ')
        .trim();

      expect(renderedDialogue).toBe(expected);
    });
  }

  it('places (MORE) on the line directly below the last dialogue line, within the page', () => {
    const blocks: Block[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...Array.from({ length: 46 }, (_, index) => ({
        type: 'action',
        text: `Action line ${index + 1}.`,
      })),
      { type: 'character', text: 'RUSSELL' },
      { type: 'parenthetical', text: PARENTHETICAL },
      { type: 'dialogue', text: RUSSELL_DIALOGUE },
    ];
    const { container } = renderScript(blocks);
    const contentHeight = getPageLayout('us-letter').contentHeightPt;

    const morePage = [
      ...container.querySelectorAll('.script-preview-page'),
    ].find((page) => page.querySelector('.split-dialogue-more'));

    expect(morePage).toBeDefined();

    const lines = pageLines(morePage as Element);
    const more = lines.find((line) => line.className === 'split-dialogue-more');
    const dialogueLines = lines.filter((line) => line.className === 'dialogue');
    const lastDialogue = dialogueLines.at(-1);

    expect(more).toBeDefined();
    expect(lastDialogue).toBeDefined();
    // (MORE) sits on the very next line after the last dialogue line.
    expect(more?.top).toBe((lastDialogue?.top ?? 0) + SCRIPT_LINE_HEIGHT_PT);
    // Nothing runs off the bottom of the page.
    expect(more?.bottom).toBeLessThanOrEqual(contentHeight);
  });

  it('keeps a parenthetical and the dialogue it introduces on separate lines (screenshot case)', () => {
    // Reproduces the reported bug: RUSSELL / (chuckles...) / split dialogue where
    // the dialogue was rendered on top of the parenthetical.
    const blocks: Block[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...Array.from({ length: 48 }, (_, index) => ({
        type: 'action',
        text: `Action line ${index + 1}.`,
      })),
      { type: 'character', text: 'RUSSELL' },
      { type: 'parenthetical', text: PARENTHETICAL },
      { type: 'dialogue', text: RUSSELL_DIALOGUE },
    ];
    const { container } = renderScript(blocks);

    for (const page of container.querySelectorAll('.script-preview-page')) {
      const lines = pageLines(page);
      const paren = lines.find((line) => line.className === 'parenthetical');
      if (!paren) continue;
      const dialogueOnParenLine = lines.filter(
        (line) =>
          line.className === 'dialogue' &&
          Math.abs(line.top - paren.top) < 0.01,
      );

      expect(dialogueOnParenLine).toHaveLength(0);
    }
  });
});
