import type { PageFormat, ScriptTypeface } from '@lambda/editor';
import { TitlePageView } from '@lambda/editor';

import {
  buildPreviewPages,
  type BuildPreviewPagesInput,
} from './buildPreviewPages';
import {
  formatPreviewFragmentText,
  isBlankPreviewFragment,
} from './formatPreviewFragmentText';
import { previewElementClassName } from './previewTypes';

export function previewFragmentClassName(
  elementType: Parameters<typeof previewElementClassName>[0],
  text: string,
): string {
  const className = previewElementClassName(elementType);

  return isBlankPreviewFragment(text)
    ? `${className} script-preview-blank-line`
    : className;
}

export type ScriptPreviewViewProps = Omit<
  BuildPreviewPagesInput,
  'pageFormat' | 'typeface'
> & {
  pageFormat?: PageFormat;
  typeface?: ScriptTypeface;
};

function fragmentMarginStyle(marginTopPt: number | undefined): {
  marginTop?: string;
} {
  if (!marginTopPt || marginTopPt <= 0) {
    return {};
  }

  return { marginTop: `${marginTopPt}pt` };
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
              {page.fragments.map((fragment, fragmentIndex) => (
                <p
                  key={`${page.pageNumber}-${fragmentIndex}`}
                  className={previewFragmentClassName(
                    fragment.elementType,
                    fragment.text,
                  )}
                  style={fragmentMarginStyle(fragment.marginTopPt)}
                >
                  {formatPreviewFragmentText(fragment.text)}
                </p>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
