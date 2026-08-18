export {
  EDIT_MENU_NATIVE_ROLES,
  FILE_MENU_ITEMS,
  VIEW_MENU_ITEMS,
  type FileMenuItem,
  type ViewMenuItem,
} from './lib/applicationMenu.js';
export {
  matchesAccelerator,
  matchesActualSizeShortcut,
  matchesZoomInShortcut,
  matchesZoomOutShortcut,
} from './lib/accelerators.js';
export { formatPlatformShortcut } from './lib/platformShortcuts.js';
