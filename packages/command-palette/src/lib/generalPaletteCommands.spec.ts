import { describe, expect, it } from 'vitest';

import {
  COMMAND_PALETTE_ACCELERATOR,
  GENERAL_PALETTE_COMMANDS,
} from './generalPaletteCommands.js';

describe('generalPaletteCommands', () => {
  it('defines new and open general commands with accelerators', () => {
    const commandIds = GENERAL_PALETTE_COMMANDS.map((command) => command.id);

    expect(commandIds).toEqual(['new', 'open']);
    expect(GENERAL_PALETTE_COMMANDS[0]?.label).toBe('New script');
    expect(GENERAL_PALETTE_COMMANDS[0]?.accelerator).toBe('CmdOrCtrl+N');
    expect(GENERAL_PALETTE_COMMANDS[1]?.label).toBe('Open…');
    expect(GENERAL_PALETTE_COMMANDS[1]?.accelerator).toBe('CmdOrCtrl+O');
  });

  it('uses CmdOrCtrl+K to open the command palette', () => {
    expect(COMMAND_PALETTE_ACCELERATOR).toBe('CmdOrCtrl+K');
  });
});
