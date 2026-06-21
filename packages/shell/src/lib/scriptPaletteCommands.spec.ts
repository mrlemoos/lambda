import { describe, expect, it } from 'vitest';

import { SCRIPT_PALETTE_COMMANDS } from './scriptPaletteCommands.js';

describe('scriptPaletteCommands', () => {
  it('defines script commands for open scripts', () => {
    expect(SCRIPT_PALETTE_COMMANDS).toEqual([
      {
        id: 'title-page',
        label: 'Title Page…',
        keywords: ['title', 'metadata', 'author', 'credit'],
      },
      {
        id: 'preview',
        label: 'Preview…',
        keywords: ['preview', 'print', 'pdf', 'export'],
      },
    ]);
  });
});
