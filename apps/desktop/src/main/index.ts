import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BrowserWindow,
  Menu,
  app,
  dialog,
  ipcMain,
  nativeTheme,
  type MenuItemConstructorOptions,
} from 'electron';

import {
  configureMacWindowChrome,
  getMacBrowserWindowOptions,
} from '../lib/macWindowChrome.js';
import { resolveWindowBackgroundColor } from '../lib/windowBackground.js';

const mainDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | null = null;

function getMainWindow(): BrowserWindow {
  if (!mainWindow) {
    throw new Error('Main window is not available');
  }

  return mainWindow;
}

function sendFileCommand(command: 'new' | 'open' | 'save' | 'save-as'): void {
  getMainWindow().webContents.send('file:command', command);
}

function buildMenu(): Menu {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
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
  ];

  return Menu.buildFromTemplate(template);
}

const isMac = process.platform === 'darwin';

function syncWindowBackgroundColor(window: BrowserWindow): void {
  window.setBackgroundColor(
    resolveWindowBackgroundColor(nativeTheme.shouldUseDarkColors),
  );
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Untitled — Lambda',
    backgroundColor: resolveWindowBackgroundColor(
      nativeTheme.shouldUseDarkColors,
    ),
    ...(isMac ? getMacBrowserWindowOptions() : {}),
    webPreferences: {
      preload: join(mainDir, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  syncWindowBackgroundColor(mainWindow);

  if (isMac) {
    configureMacWindowChrome(mainWindow);
  }

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(mainDir, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu());
  registerIpcHandlers();
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      syncWindowBackgroundColor(mainWindow);
    }
  });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers(): void {
  ipcMain.handle('dialog:open', async () => {
    const result = await dialog.showOpenDialog(getMainWindow(), {
      properties: ['openFile'],
      filters: [
        { name: 'Fountain', extensions: ['fountain', 'txt'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('dialog:save', async (_event, defaultName?: string) => {
    const result = await dialog.showSaveDialog(getMainWindow(), {
      defaultPath: defaultName ?? 'Untitled.fountain',
      filters: [
        { name: 'Fountain', extensions: ['fountain', 'txt'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  });

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    return readFile(filePath, 'utf8');
  });

  ipcMain.handle(
    'file:write',
    async (_event, filePath: string, contents: string) => {
      await writeFile(filePath, contents, 'utf8');
      return basename(filePath);
    },
  );

  ipcMain.handle('window:set-title', (_event, title: string) => {
    getMainWindow().setTitle(title);
  });
}
