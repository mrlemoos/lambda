import { contextBridge, ipcRenderer } from 'electron';

import type { FileCommand, LambdaApi } from './api.js';

const api: LambdaApi = {
  platform: process.platform,
  onFileCommand(listener) {
    const handler = (_event: Electron.IpcRendererEvent, command: string) => {
      listener(command as FileCommand);
    };

    ipcRenderer.on('file:command', handler);

    return () => {
      ipcRenderer.removeListener('file:command', handler);
    };
  },
  readFile(filePath) {
    return ipcRenderer.invoke('file:read', filePath);
  },
  writeFile(filePath, contents) {
    return ipcRenderer.invoke('file:write', filePath, contents);
  },
  showOpenDialog() {
    return ipcRenderer.invoke('dialog:open');
  },
  showSaveDialog(defaultName) {
    return ipcRenderer.invoke('dialog:save', defaultName);
  },
  setWindowTitle(title) {
    return ipcRenderer.invoke('window:set-title', title);
  },
};

contextBridge.exposeInMainWorld('lambda', api);
