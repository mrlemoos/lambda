import { describe, expect, it, vi } from 'vitest';

import { formatPlatformShortcut } from './platformShortcuts.js';

describe('formatPlatformShortcut', () => {
  it('formats CmdOrCtrl shortcuts for macOS', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });

    const result = formatPlatformShortcut('CmdOrCtrl+Shift+Z');

    expect(result).toBe('⌘⇧Z');
  });

  it('formats CmdOrCtrl shortcuts for non-macOS', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });

    const result = formatPlatformShortcut('CmdOrCtrl+S');

    expect(result).toBe('Ctrl+S');
  });
});
