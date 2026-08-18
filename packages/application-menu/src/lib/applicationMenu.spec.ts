import { describe, expect, it } from 'vitest';

import { FILE_MENU_ITEMS, VIEW_MENU_ITEMS } from './applicationMenu.js';

describe('application menu definitions', () => {
  it('includes New, Open, Save, and Preview file commands', () => {
    const commands = FILE_MENU_ITEMS.flatMap((item) =>
      'command' in item ? [item.command] : [],
    );

    expect(commands).toEqual(
      expect.arrayContaining(['new', 'open', 'save', 'save-as', 'preview']),
    );
  });

  it('includes zoom view commands', () => {
    const commands = VIEW_MENU_ITEMS.flatMap((item) =>
      'command' in item ? [item.command] : [],
    );

    expect(commands).toEqual(['in', 'out', 'actual-size']);
  });
});
