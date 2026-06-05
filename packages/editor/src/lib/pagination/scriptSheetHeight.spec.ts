import { describe, expect, it } from 'vitest';

import { getPageLayout } from './pageLayout';
import { paginateScript } from './paginateScript';
import { resolveScriptSheetHeightPt } from './scriptSheetHeight';
import type { PaginationResult } from './types';

describe('resolveScriptSheetHeightPt', () => {
  it('reserves at least one full sheet when pagination has no measured body height yet', () => {
    const layout = getPageLayout('us-letter');
    const pagination: PaginationResult = {
      pages: [{ number: 1, topOffsetPt: 0 }],
      boundaries: [],
      placements: [],
      totalHeightPt: 0,
      pageFormat: 'us-letter',
    };

    expect(resolveScriptSheetHeightPt(pagination, layout)).toBe(
      layout.pageHeightPt,
    );
  });
});

describe('paginateScript minimum page height', () => {
  it('reserves at least one page of body height for an empty script', () => {
    const layout = getPageLayout('us-letter');

    expect(paginateScript([]).totalHeightPt).toBeGreaterThanOrEqual(
      layout.contentHeightPt,
    );
  });
});
