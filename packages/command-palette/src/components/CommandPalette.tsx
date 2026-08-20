import { Command } from 'cmdk';
import { useEffect, useState } from 'react';

import { matchesAccelerator } from '@lambda/application-menu';
import {
  COMMAND_PALETTE_ACCELERATOR,
  GENERAL_PALETTE_COMMANDS,
  type GeneralPaletteCommandId,
} from '../lib/generalPaletteCommands.js';
import { SCRIPT_PALETTE_COMMANDS } from '../lib/scriptPaletteCommands.js';
import type { ScriptPaletteCommandId } from '../lib/scriptPaletteCommands.js';
import { formatPlatformShortcut } from '@lambda/application-menu';
import {
  COMMAND_PALETTE_DIALOG_CLASS,
  useCommandPaletteDrag,
} from '../lib/useCommandPaletteDrag.js';
import { useScriptSession } from '@lambda/script-session';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const {
    script,
    startNewScript,
    openScriptFromDisk,
    openTitlePageDialog,
    openPreview,
  } = useScriptSession();
  const { dragHandleProps } = useCommandPaletteDrag(open);

  const runCommand = (commandId: GeneralPaletteCommandId) => {
    if (commandId === 'new') {
      void startNewScript();
      return;
    }

    void openScriptFromDisk();
  };

  const runScriptCommand = (commandId: ScriptPaletteCommandId) => {
    if (commandId === 'title-page') {
      openTitlePageDialog();
      return;
    }

    openPreview();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      className="command-palette"
      overlayClassName="command-palette-overlay"
      contentClassName={COMMAND_PALETTE_DIALOG_CLASS}
    >
      <div {...dragHandleProps} />
      <Command.Input
        className="command-palette-input"
        placeholder="Type a command…"
      />
      <Command.List className="command-palette-list">
        <Command.Empty className="command-palette-empty">
          No results found.
        </Command.Empty>
        <Command.Group
          className="command-palette-group"
          heading="General"
          value="general"
        >
          {GENERAL_PALETTE_COMMANDS.map((command) => (
            <Command.Item
              key={command.id}
              className="command-palette-item"
              value={command.id}
              keywords={command.keywords}
              onSelect={() => {
                runCommand(command.id);
                onOpenChange(false);
              }}
            >
              <span>{command.label}</span>
              <kbd className="command-palette-shortcut">
                {formatPlatformShortcut(command.accelerator)}
              </kbd>
            </Command.Item>
          ))}
        </Command.Group>
        {script ? (
          <Command.Group
            className="command-palette-group"
            heading="Script"
            value="script"
          >
            {SCRIPT_PALETTE_COMMANDS.map((command) => (
              <Command.Item
                key={command.id}
                className="command-palette-item"
                value={command.id}
                keywords={command.keywords}
                onSelect={() => {
                  runScriptCommand(command.id);
                  onOpenChange(false);
                }}
              >
                <span>{command.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
    </Command.Dialog>
  );
}

export function CommandPaletteHost() {
  const [open, setOpen] = useState(false);
  const [paletteKey, setPaletteKey] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!matchesAccelerator(event, COMMAND_PALETTE_ACCELERATOR)) {
        return;
      }

      event.preventDefault();
      setOpen((value) => !value);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setPaletteKey((value) => value + 1);
    }
  };

  return (
    <CommandPalette
      key={paletteKey}
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
}
