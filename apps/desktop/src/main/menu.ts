import type { MenuItemConstructorOptions } from 'electron';

import {
  EDIT_MENU_NATIVE_ROLES,
  FILE_MENU_ITEMS,
  type FileCommand,
} from '@lambda/shell';

type CreateApplicationMenuTemplateOptions = {
  appName: string;
  isMac: boolean;
  sendFileCommand: (command: FileCommand) => void;
};

export function createApplicationMenuTemplate({
  appName,
  isMac,
  sendFileCommand,
}: CreateApplicationMenuTemplateOptions): MenuItemConstructorOptions[] {
  const fileSubmenu: MenuItemConstructorOptions[] = FILE_MENU_ITEMS.map(
    (item) => {
      if ('type' in item) {
        return { type: 'separator' };
      }

      return {
        label: item.label,
        accelerator: item.accelerator,
        click: () => sendFileCommand(item.command),
      };
    },
  );

  if (!isMac) {
    fileSubmenu.push({ type: 'separator' }, { role: 'quit' });
  }

  const editSubmenu: MenuItemConstructorOptions[] = [
    { role: EDIT_MENU_NATIVE_ROLES[0] },
    { role: EDIT_MENU_NATIVE_ROLES[1] },
    { type: 'separator' },
    { role: EDIT_MENU_NATIVE_ROLES[2] },
    { role: EDIT_MENU_NATIVE_ROLES[3] },
    { role: EDIT_MENU_NATIVE_ROLES[4] },
    { role: EDIT_MENU_NATIVE_ROLES[5] },
  ];

  return [
    ...(isMac
      ? [
          {
            label: appName,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: fileSubmenu,
    },
    {
      label: 'Edit',
      submenu: editSubmenu,
    },
  ];
}
