import { describe, expect, it } from 'vitest';

import { resolveWindowBackgroundColor } from './windowBackground.js';

describe('resolveWindowBackgroundColor', () => {
  it('uses a transparent window on macOS so vibrancy can show through', () => {
    expect(resolveWindowBackgroundColor(true, 'darwin')).toBe('#00000000');
    expect(resolveWindowBackgroundColor(false, 'darwin')).toBe('#00000000');
  });

  it('uses pitch black when the system prefers dark mode on other platforms', () => {
    expect(resolveWindowBackgroundColor(true, 'linux')).toBe('#000000');
  });

  it('uses a light shell colour when the system prefers light mode on other platforms', () => {
    expect(resolveWindowBackgroundColor(false, 'win32')).toBe('#e8e8ec');
  });
});
