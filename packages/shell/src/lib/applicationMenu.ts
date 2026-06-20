import type { FileCommand } from './api.js';

export type FileMenuItem =
  | {
      label: string;
      accelerator: string;
      command: FileCommand;
    }
  | { type: 'separator' };

export const FILE_MENU_ITEMS: FileMenuItem[] = [
  { label: 'New', accelerator: 'CmdOrCtrl+N', command: 'new' },
  { label: 'Open…', accelerator: 'CmdOrCtrl+O', command: 'open' },
  { type: 'separator' },
  { label: 'Save', accelerator: 'CmdOrCtrl+S', command: 'save' },
  { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', command: 'save-as' },
];

export const EDIT_MENU_NATIVE_ROLES = [
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'selectAll',
] as const;
