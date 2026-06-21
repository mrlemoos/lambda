import { describe, expect, it } from 'vitest';

import { getPageLayout } from './pageLayout';
import { resolvePageNumberTopPt } from './resolvePageNumberTopPt';

describe('resolvePageNumberTopPt', () => {
  it('places page 1 at the top-right of the first body sheet', () => {
    const layout = getPageLayout('us-letter');

    const result = resolvePageNumberTopPt(
      { number: 1, topOffsetPt: 0 },
      'us-letter',
      false,
    );

    expect(result).toBe(layout.paddingTopPt);
  });

  it('places page 1 after a title page on the second physical sheet', () => {
    const layout = getPageLayout('us-letter');

    const result = resolvePageNumberTopPt(
      { number: 1, topOffsetPt: layout.contentHeightPt },
      'us-letter',
      true,
    );

    expect(result).toBe(layout.pageHeightPt + layout.paddingTopPt);
  });

  it('places page 2 on the third physical sheet when a title page is present', () => {
    const layout = getPageLayout('us-letter');

    const result = resolvePageNumberTopPt(
      { number: 2, topOffsetPt: layout.contentHeightPt * 2 },
      'us-letter',
      true,
    );

    expect(result).toBe(layout.pageHeightPt * 2 + layout.paddingTopPt);
  });
});
