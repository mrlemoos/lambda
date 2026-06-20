import {
  EDIT_MENU_NATIVE_ROLES,
  FILE_MENU_ITEMS,
  type FileCommand,
} from '@lambda/shell';
import { useScriptEditorCommands } from '@lambda/editor';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { browserLambdaApi } from '../lib/browserLambdaApi.js';

const EDIT_MENU_LABELS: Record<
  (typeof EDIT_MENU_NATIVE_ROLES)[number],
  { label: string; accelerator: string }
> = {
  undo: { label: 'Undo', accelerator: 'CmdOrCtrl+Z' },
  redo: { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z' },
  cut: { label: 'Cut', accelerator: 'CmdOrCtrl+X' },
  copy: { label: 'Copy', accelerator: 'CmdOrCtrl+C' },
  paste: { label: 'Paste', accelerator: 'CmdOrCtrl+V' },
  selectAll: { label: 'Select All', accelerator: 'CmdOrCtrl+A' },
};

function formatShortcut(accelerator: string): string {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

  return accelerator
    .replace('CmdOrCtrl', isMac ? '⌘' : 'Ctrl')
    .replace('Shift', isMac ? '⇧' : 'Shift')
    .replace('+', isMac ? '' : '+');
}

function matchesAccelerator(
  event: KeyboardEvent,
  accelerator: string,
): boolean {
  const parts = accelerator.split('+');
  const key = parts[parts.length - 1]?.toLowerCase() ?? '';
  const needsShift = parts.includes('Shift');
  const needsMeta = parts.includes('CmdOrCtrl') || parts.includes('Cmd');
  const metaPressed = event.metaKey || event.ctrlKey;

  if (needsMeta !== metaPressed) {
    return false;
  }

  if (needsShift !== event.shiftKey) {
    return false;
  }

  return event.key.toLowerCase() === key.toLowerCase();
}

function MenuDropdown({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  return (
    <div className="application-menu" ref={rootRef}>
      <button
        type="button"
        className="application-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open ? (
        <ul className="application-menu-panel" role="menu">
          {children}
        </ul>
      ) : null}
    </div>
  );
}

export function ApplicationMenuBar() {
  const editorCommands = useScriptEditorCommands();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const item of FILE_MENU_ITEMS) {
        if ('type' in item) {
          continue;
        }

        if (matchesAccelerator(event, item.accelerator)) {
          event.preventDefault();
          browserLambdaApi.dispatchFileCommand(item.command);
          return;
        }
      }

      if (!editorCommands) {
        return;
      }

      for (const role of EDIT_MENU_NATIVE_ROLES) {
        const { accelerator } = EDIT_MENU_LABELS[role];

        if (!matchesAccelerator(event, accelerator)) {
          continue;
        }

        event.preventDefault();
        editorCommands[role]();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorCommands]);

  const dispatchFile = (command: FileCommand) => {
    browserLambdaApi.dispatchFileCommand(command);
  };

  const runEdit = (role: (typeof EDIT_MENU_NATIVE_ROLES)[number]) => {
    editorCommands?.[role]();
  };

  return (
    <nav className="application-menu-bar" aria-label="Application menu">
      <MenuDropdown label="File">
        {FILE_MENU_ITEMS.map((item, index) => {
          if ('type' in item) {
            return (
              <li
                key={`separator-${index}`}
                className="application-menu-separator"
                role="separator"
              />
            );
          }

          return (
            <li key={item.command} role="none">
              <button
                type="button"
                className="application-menu-item"
                role="menuitem"
                onClick={() => dispatchFile(item.command)}
              >
                <span>{item.label}</span>
                <span className="application-menu-shortcut">
                  {formatShortcut(item.accelerator)}
                </span>
              </button>
            </li>
          );
        })}
      </MenuDropdown>
      <MenuDropdown label="Edit">
        {EDIT_MENU_NATIVE_ROLES.map((role, index) => {
          const { label, accelerator } = EDIT_MENU_LABELS[role];
          const showSeparator = role === 'redo';

          return (
            <li key={role} role="none">
              <button
                type="button"
                className="application-menu-item"
                role="menuitem"
                disabled={!editorCommands}
                onClick={() => runEdit(role)}
              >
                <span>{label}</span>
                <span className="application-menu-shortcut">
                  {formatShortcut(accelerator)}
                </span>
              </button>
              {showSeparator ? (
                <div className="application-menu-separator" role="separator" />
              ) : null}
            </li>
          );
        })}
      </MenuDropdown>
    </nav>
  );
}
