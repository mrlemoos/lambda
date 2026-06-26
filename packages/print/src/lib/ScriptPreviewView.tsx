import type { ReactElement } from 'react';
import type { PageFormat, ScriptTypeface } from '@lambda/editor';
import { SCRIPT_LINE_HEIGHT_PT, TitlePageView } from '@lambda/editor';

import {
  buildPreviewPages,
  type BuildPreviewPagesInput,
} from './buildPreviewPages';
import { expandPreviewFragmentLines } from './formatPaginatedFragmentText';
import type { PreviewFragment } from './previewTypes';
import { resolveFlowFragmentTops } from './resolveFlowFragmentTops';

export type ScriptPreviewViewProps = Omit<
  BuildPreviewPagesInput,
  'pageFormat' | 'typeface'
> & {
  pageFormat?: PageFormat;
  typeface?: ScriptTypeface;
};

function renderFragmentLines(
  fragment: PreviewFragment,
  fragmentTopPt: number,
  lineCount: number | undefined,
  pageFormat: PageFormat,
  typeface: ScriptTypeface,
  keyPrefix: string,
): ReactElement[] {
  const lines = expandPreviewFragmentLines(
    fragment,
    pageFormat,
    typeface,
  ).slice(0, lineCount);

  return lines.map((line, lineIndex) => (
    <p
      key={`${keyPrefix}-${lineIndex}`}
      className={line.className}
      style={{ top: `${fragmentTopPt + lineIndex * SCRIPT_LINE_HEIGHT_PT}pt` }}
    >
      {line.text}
    </p>
  ));
}

export function ScriptPreviewView({
  blocks,
  pagination,
  pageFormat = 'us-letter',
  typeface = 'courier-prime',
  titlePageLines,
}: ScriptPreviewViewProps) {
  const preview = buildPreviewPages({
    blocks,
    pagination,
    pageFormat,
    typeface,
    titlePageLines,
  });

  return (
    <div
      className="script-preview-stack"
      data-page-format={pageFormat}
      data-typeface={typeface}
    >
      {preview.pages.map((page, pageIndex) => {
        if (page.kind === 'title') {
          return (
            <TitlePageView
              key="title-page"
              lines={titlePageLines}
              pageFormat={pageFormat}
            />
          );
        }

        const flowLayout = resolveFlowFragmentTops(
          page.fragments,
          page.contentTopOffsetPt ?? 0,
          pageFormat,
          typeface,
        );

        return (
          <article
            key={`body-page-${page.pageNumber ?? pageIndex}`}
            className="script-preview-page"
            data-page-format={pageFormat}
            data-typeface={typeface}
          >
            {page.pageNumber ? (
              <span className="script-preview-page-number">
                {page.pageNumber}.
              </span>
            ) : null}
            <div className="script-preview-page-body">
              {page.fragments.flatMap((fragment, fragmentIndex) =>
                renderFragmentLines(
                  fragment,
                  flowLayout.tops[fragmentIndex] ?? 0,
                  flowLayout.lineCounts[fragmentIndex],
                  pageFormat,
                  typeface,
                  `${page.pageNumber}-flow-${fragmentIndex}`,
                ),
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
