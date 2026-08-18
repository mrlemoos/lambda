import { describe, expect, it } from 'vitest';

import {
  matchesAccelerator,
  matchesActualSizeShortcut,
  matchesZoomInShortcut,
  matchesZoomOutShortcut,
} from './accelerators.js';

describe('matchesAccelerator', () => {
  it('matches CmdOrCtrl shortcuts', () => {
    const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });

    const result = matchesAccelerator(event, 'CmdOrCtrl+S');

    expect(result).toBe(true);
  });

  it('requires shift when the accelerator includes Shift', () => {
    const withoutShift = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    });
    const withShift = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: true,
    });

    expect(matchesAccelerator(withoutShift, 'CmdOrCtrl+Shift+Z')).toBe(false);
    expect(matchesAccelerator(withShift, 'CmdOrCtrl+Shift+Z')).toBe(true);
  });
});

describe('matchesZoomInShortcut', () => {
  it('matches equals, plus, and numpad add with CmdOrCtrl', () => {
    const equals = new KeyboardEvent('keydown', { key: '=', metaKey: true });
    const plus = new KeyboardEvent('keydown', {
      key: '+',
      metaKey: true,
      shiftKey: true,
    });
    const numpadAdd = new KeyboardEvent('keydown', {
      key: 'Add',
      metaKey: true,
    });

    expect(matchesZoomInShortcut(equals)).toBe(true);
    expect(matchesZoomInShortcut(plus)).toBe(true);
    expect(matchesZoomInShortcut(numpadAdd)).toBe(true);
  });
});

describe('matchesZoomOutShortcut', () => {
  it('matches minus and numpad subtract with CmdOrCtrl', () => {
    const minus = new KeyboardEvent('keydown', { key: '-', metaKey: true });
    const numpadSubtract = new KeyboardEvent('keydown', {
      key: 'Subtract',
      metaKey: true,
    });

    expect(matchesZoomOutShortcut(minus)).toBe(true);
    expect(matchesZoomOutShortcut(numpadSubtract)).toBe(true);
  });
});

describe('matchesActualSizeShortcut', () => {
  it('matches CmdOrCtrl+0', () => {
    const event = new KeyboardEvent('keydown', { key: '0', metaKey: true });

    const result = matchesActualSizeShortcut(event);

    expect(result).toBe(true);
  });
});
