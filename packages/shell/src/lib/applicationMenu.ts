import type { FileCommand, ViewCommand } from './api.js';

export type FileMenuItem =
  | {
      label: string;
      accelerator?: string;
      command: FileCommand;
    }
  | { type: 'separator' };

export type ViewMenuItem =
  | {
      label: string;
      accelerator: string;
      command: ViewCommand;
    }
  | { type: 'separator' };

export const FILE_MENU_ITEMS: FileMenuItem[] = [
  { label: 'New', accelerator: 'CmdOrCtrl+N', command: 'new' },
  { label: 'Open…', accelerator: 'CmdOrCtrl+O', command: 'open' },
  { type: 'separator' },
  { label: 'Save', accelerator: 'CmdOrCtrl+S', command: 'save' },
  { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', command: 'save-as' },
  { type: 'separator' },
  { label: 'Title Page…', command: 'title-page' },
];

export const VIEW_MENU_ITEMS: ViewMenuItem[] = [
  { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', command: 'in' },
  { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', command: 'out' },
  { type: 'separator' },
  { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', command: 'actual-size' },
];

export const EDIT_MENU_NATIVE_ROLES = [
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'selectAll',
] as const;
