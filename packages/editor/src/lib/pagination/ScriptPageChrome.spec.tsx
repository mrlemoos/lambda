import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getPageLayout, PT_PER_INCH } from './pageLayout';
import { ScriptPageChrome } from './ScriptPageChrome';
import type { PaginationResult } from './types';

function ptToInches(pt: number): string {
  return `${pt / PT_PER_INCH}in`;
}

describe('ScriptPageChrome', () => {
  it('keeps page 1 below the title page sheet', () => {
    const layout = getPageLayout('us-letter');
    const pagination: PaginationResult = {
      pages: [{ number: 1, topOffsetPt: layout.contentHeightPt }],
      boundaries: [{ offsetPt: layout.contentHeightPt }],
      placements: [],
      totalHeightPt: layout.contentHeightPt * 2,
      pageFormat: 'us-letter',
      hasTitlePage: true,
    };

    render(<ScriptPageChrome pagination={pagination} />);

    const pageNumber = screen.getByText('1.');

    expect(pageNumber).toHaveStyle({
      top: ptToInches(layout.pageHeightPt + layout.paddingTopPt),
    });
  });
});
