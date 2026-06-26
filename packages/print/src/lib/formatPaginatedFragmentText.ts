import {
  charsPerLine,
  ELEMENT_METRICS,
  fountainPrintText,
  getPageLayout,
  wrapTextLines,
  type PageFormat,
  type ScriptElementType,
  type ScriptTypeface,
} from '@lambda/editor';

import {
  previewFragmentClassName,
  type PreviewElementType,
  type PreviewFragment,
} from './previewTypes';

const WRAPPED_PREVIEW_TYPES = new Set<PreviewElementType>([
  'action',
  'centeredText',
  'dialogue',
  'parenthetical',
]);

function isWrappedPreviewType(
  elementType: PreviewElementType,
): elementType is PreviewElementType & ScriptElementType {
  return WRAPPED_PREVIEW_TYPES.has(elementType);
}

export type PreviewRenderedLine = {
  className: string;
  text: string;
};

/** Match pagination line breaks so preview height aligns with page metrics. */
export function formatPaginatedFragmentText(
  text: string,
  elementType: PreviewElementType,
  pageFormat: PageFormat,
  typeface: ScriptTypeface,
): string {
  return expandPreviewFragmentLines({ elementType, text }, pageFormat, typeface)
    .map((line) => line.text)
    .join('\n');
}

/** One DOM row per pagination line — avoids clipping from multi-line pre-wrap blocks. */
export function expandPreviewFragmentLines(
  fragment: Pick<
    PreviewFragment,
    'elementType' | 'text' | 'paginationLineCount'
  >,
  pageFormat: PageFormat,
  typeface: ScriptTypeface,
): PreviewRenderedLine[] {
  const className = previewFragmentClassName(
    fragment.elementType,
    fragment.text,
  );

  if (fragment.text.length === 0) {
    return [{ className, text: '\u00a0' }];
  }

  if (fragment.elementType === 'splitDialogueMore') {
    return [{ className, text: fragment.text }];
  }

  if (!isWrappedPreviewType(fragment.elementType)) {
    return [{ className, text: fountainPrintText(fragment.text) }];
  }

  const layout = getPageLayout(pageFormat);
  const metrics = ELEMENT_METRICS[fragment.elementType];
  const charsPerLineCount = charsPerLine(metrics, layout, typeface);
  const wrappedLines = wrapTextLines(fragment.text, charsPerLineCount);
  const linesToRender =
    fragment.paginationLineCount === undefined
      ? wrappedLines
      : wrappedLines.slice(0, fragment.paginationLineCount);

  return linesToRender.map((line) => ({
    className,
    text: fountainPrintText(
      fragment.text.slice(line.startOffset, line.endOffset),
    ),
  }));
}
