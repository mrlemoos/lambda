import { describe, expect, it } from 'vitest';

import {
  formatPreviewFragmentText,
  isBlankPreviewFragment,
} from './formatPreviewFragmentText';

describe('formatPreviewFragmentText', () => {
  it('strips forced action prefixes for print', () => {
    expect(formatPreviewFragmentText('!OUTSIDE THE WINDSHIELD')).toBe(
      'OUTSIDE THE WINDSHIELD',
    );
  });

  it('preserves blank lines as non-breaking space', () => {
    expect(formatPreviewFragmentText('')).toBe('\u00a0');
    expect(isBlankPreviewFragment('')).toBe(true);
  });
});
