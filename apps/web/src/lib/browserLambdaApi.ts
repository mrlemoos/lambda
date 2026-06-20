import type { FileCommand, LambdaApi } from '@lambda/shell';

const FOUNTAIN_ACCEPT = {
  'text/plain': ['.fountain', '.txt'],
};

type FileCommandListener = (command: FileCommand) => void;

export type BrowserLambdaApi = LambdaApi & {
  dispatchFileCommand: (command: FileCommand) => void;
};

// Web uses file names as path keys — there are no native filesystem paths in the browser.
export function createBrowserLambdaApi(): BrowserLambdaApi {
  const fileHandles = new Map<string, FileSystemFileHandle>();
  const fallbackFiles = new Map<string, File>();
  const listeners = new Set<FileCommandListener>();

  let openInput: HTMLInputElement | null = null;

  function hasFileSystemAccess(): boolean {
    return typeof window.showOpenFilePicker === 'function';
  }

  function dispatchFileCommand(command: FileCommand): void {
    for (const listener of listeners) {
      listener(command);
    }
  }

  function getOpenInput(): HTMLInputElement {
    if (!openInput) {
      openInput = document.createElement('input');
      openInput.type = 'file';
      openInput.accept = '.fountain,.txt,text/plain';
      openInput.hidden = true;
      document.body.appendChild(openInput);
    }

    return openInput;
  }

  function pickFileWithInput(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = getOpenInput();

      input.onchange = () => {
        resolve(input.files?.[0] ?? null);
        input.value = '';
      };

      input.click();
    });
  }

  function downloadFile(fileName: string, contents: string): void {
    const blob = new Blob([contents], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function readFileText(file: File): Promise<string> {
    if (typeof file.text === 'function') {
      return file.text();
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  return {
    platform: 'web',

    onFileCommand(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    async readFile(filePath) {
      const handle = fileHandles.get(filePath);

      if (handle) {
        const file = await handle.getFile();
        return file.text();
      }

      const fallbackFile = fallbackFiles.get(filePath);

      if (!fallbackFile) {
        throw new Error('Could not open this file.');
      }

      return readFileText(fallbackFile);
    },

    async writeFile(filePath, contents) {
      const handle = fileHandles.get(filePath);

      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(contents);
        await writable.close();
        return filePath;
      }

      downloadFile(filePath, contents);
      fallbackFiles.set(
        filePath,
        new File([contents], filePath, { type: 'text/plain' }),
      );
      return filePath;
    },

    async showOpenDialog() {
      if (hasFileSystemAccess()) {
        const showOpen = window.showOpenFilePicker;
        if (!showOpen) {
          return null;
        }

        const [handle] = await showOpen({
          types: [{ accept: FOUNTAIN_ACCEPT }],
          multiple: false,
        });
        fileHandles.set(handle.name, handle);
        return handle.name;
      }

      const file = await pickFileWithInput();

      if (!file) {
        return null;
      }

      fallbackFiles.set(file.name, file);
      return file.name;
    },

    async showSaveDialog(defaultName = 'Untitled.fountain') {
      if (hasFileSystemAccess()) {
        const showSave = window.showSaveFilePicker;
        if (!showSave) {
          return defaultName;
        }

        const handle = await showSave({
          suggestedName: defaultName,
          types: [{ accept: FOUNTAIN_ACCEPT }],
        });
        fileHandles.set(handle.name, handle);
        return handle.name;
      }

      return defaultName;
    },

    async setWindowTitle(title) {
      document.title = title;
    },

    dispatchFileCommand,
  };
}

export const browserLambdaApi = createBrowserLambdaApi();
