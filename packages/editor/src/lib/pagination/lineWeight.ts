import type { PageLayout } from './pageLayout';
import { SCRIPT_LINE_HEIGHT_PT } from './pageLayout';
import type { ScriptBlock, ScriptElementType } from './types';

function countTextLines(text: string, charsPerLine: number): number {
  if (text.length === 0) {
    return 1;
  }

  const paragraphs = text.split('\n');

  return paragraphs.reduce((total, paragraph) => {
    const trimmed = paragraph.length === 0 ? '' : paragraph;

    if (trimmed.length === 0) {
      return total + 1;
    }

    return total + Math.max(1, Math.ceil(trimmed.length / charsPerLine));
  }, 0);
}

const PAGINATION_WEIGHT: Record<
  ScriptElementType,
  { spacingLines: number; countsText: boolean }
> = {
  action: { spacingLines: 1, countsText: true },
  sceneHeading: { spacingLines: 2, countsText: true },
  character: { spacingLines: 1, countsText: true },
  parenthetical: { spacingLines: 0, countsText: true },
  dialogue: { spacingLines: 0, countsText: true },
  transition: { spacingLines: 1, countsText: true },
  section: { spacingLines: 0, countsText: false },
  synopsis: { spacingLines: 0, countsText: false },
  note: { spacingLines: 0, countsText: false },
  titlePage: { spacingLines: 0, countsText: false },
  pageBreak: { spacingLines: 0, countsText: false },
  splitDialogueCharacter: { spacingLines: 0, countsText: false },
};

const VISUAL_WEIGHT: Record<
  ScriptElementType,
  { spacingLines: number; countsText: boolean }
> = {
  ...PAGINATION_WEIGHT,
  section: { spacingLines: 1, countsText: true },
  synopsis: { spacingLines: 1, countsText: true },
  note: { spacingLines: 1, countsText: true },
};

function measureBlock(
  block: ScriptBlock,
  layout: PageLayout,
  weights: typeof PAGINATION_WEIGHT,
): number {
  const rule = weights[block.type];
  const textLines = rule.countsText
    ? countTextLines(block.text, layout.charsPerLine)
    : 0;

  return rule.spacingLines + textLines;
}

export function paginationLineWeight(
  block: ScriptBlock,
  layout: PageLayout,
): number {
  return measureBlock(block, layout, PAGINATION_WEIGHT);
}

export function visualLineWeight(
  block: ScriptBlock,
  layout: PageLayout,
): number {
  return measureBlock(block, layout, VISUAL_WEIGHT);
}

export function visualHeightPt(block: ScriptBlock, layout: PageLayout): number {
  return visualLineWeight(block, layout) * SCRIPT_LINE_HEIGHT_PT;
}
