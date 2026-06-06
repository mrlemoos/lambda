import type { MenuItemConstructorOptions } from 'electron';

type FileCommand = 'new' | 'open' | 'save' | 'save-as';

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
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendFileCommand('new'),
        },
        {
          label: 'Open…',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendFileCommand('open'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendFileCommand('save'),
        },
        {
          label: 'Save As…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendFileCommand('save-as'),
        },
        ...(isMac
          ? []
          : [{ type: 'separator' as const }, { role: 'quit' as const }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
  ];
}
