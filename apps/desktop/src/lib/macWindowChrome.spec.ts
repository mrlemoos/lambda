import { describe, expect, it } from 'vitest';

import { getMacBrowserWindowOptions } from './macWindowChrome.js';

describe('getMacBrowserWindowOptions', () => {
  it('keeps the traffic lights visible with a hidden inset title bar', () => {
    expect(getMacBrowserWindowOptions()).toMatchObject({
      titleBarStyle: 'hiddenInset',
      transparent: true,
      titleBarOverlay: {
        color: '#00000000',
        height: 40,
      },
    });
  });
});
