export type FileCommand = 'new' | 'open' | 'save' | 'save-as';

export type LambdaPlatform = 'darwin' | 'linux' | 'win32' | 'web';

export type LambdaApi = {
  platform: LambdaPlatform;
  onFileCommand: (listener: (command: FileCommand) => void) => () => void;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, contents: string) => Promise<string>;
  showOpenDialog: () => Promise<string | null>;
  showSaveDialog: (defaultName?: string) => Promise<string | null>;
  setWindowTitle: (title: string) => Promise<void>;
};
