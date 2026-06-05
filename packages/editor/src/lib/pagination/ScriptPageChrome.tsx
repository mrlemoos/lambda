import type { PaginationResult } from './types';
import { getPageLayout, PT_PER_INCH } from './pageLayout';

export type ScriptPageChromeProps = {
  pagination: PaginationResult;
};

function ptToInches(pt: number): string {
  return `${pt / PT_PER_INCH}in`;
}

export function ScriptPageChrome({ pagination }: ScriptPageChromeProps) {
  const layout = getPageLayout(pagination.pageFormat);

  return (
    <div
      className="script-page-chrome"
      aria-hidden
      style={{
        minHeight: ptToInches(
          layout.paddingTopPt +
            pagination.totalHeightPt +
            layout.paddingBottomPt,
        ),
      }}
    >
      {pagination.pages.map((page) => (
        <span
          key={page.number}
          className="script-page-number"
          style={{
            top: ptToInches(layout.paddingTopPt + page.topOffsetPt),
          }}
        >
          {page.number}.
        </span>
      ))}
      {pagination.boundaries.map((boundary, index) => (
        <hr
          key={`boundary-${index}`}
          className="script-page-boundary"
          style={{
            top: ptToInches(layout.paddingTopPt + boundary.offsetPt),
          }}
        />
      ))}
    </div>
  );
}
