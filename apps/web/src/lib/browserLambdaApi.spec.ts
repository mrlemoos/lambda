import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createBrowserLambdaApi,
  type BrowserLambdaApi,
} from './browserLambdaApi.js';

describe('createBrowserLambdaApi', () => {
  let api: BrowserLambdaApi;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.title = '';
    vi.restoreAllMocks();
    api = createBrowserLambdaApi();
  });

  it('sets document.title via setWindowTitle', async () => {
    await api.setWindowTitle('MyScript.fountain — Lambda');

    expect(document.title).toBe('MyScript.fountain — Lambda');
  });

  it('notifies file command listeners', () => {
    const listener = vi.fn();

    api.onFileCommand(listener);
    api.dispatchFileCommand('new');

    expect(listener).toHaveBeenCalledWith('new');
  });

  it('reads and writes via File System Access handles', async () => {
    const write = vi.fn(async (data: string) => {
      await data;
    });
    const close = vi.fn(async () => undefined);
    const getFile = vi.fn(async () => ({
      text: async () => 'INT. HOUSE - DAY\n',
    }));
    const handle = {
      name: 'house.fountain',
      getFile,
      createWritable: vi.fn(async () => ({ write, close })),
    } as unknown as FileSystemFileHandle;

    window.showOpenFilePicker = vi.fn(async () => [handle]);
    api = createBrowserLambdaApi();

    const path = await api.showOpenDialog();

    expect(path).toBe('house.fountain');

    const text = await api.readFile('house.fountain');

    expect(text).toBe('INT. HOUSE - DAY\n');

    await api.writeFile('house.fountain', 'Updated\n');

    expect(write).toHaveBeenCalledWith('Updated\n');
    expect(close).toHaveBeenCalled();
  });

  it('falls back to file input and download when FSAA is unavailable', async () => {
    Reflect.deleteProperty(window, 'showOpenFilePicker');
    Reflect.deleteProperty(window, 'showSaveFilePicker');

    const file = new File(['Fallback line\n'], 'fallback.fountain', {
      type: 'text/plain',
    });

    const originalCreateElement = document.createElement.bind(document);
    const inputClick = vi.fn(function click(this: HTMLInputElement) {
      Object.defineProperty(this, 'files', {
        configurable: true,
        value: [file],
      });
      this.dispatchEvent(new Event('change'));
    });

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') {
        const input = originalCreateElement('input');
        input.click = inputClick;
        return input;
      }

      return originalCreateElement(tagName);
    });

    api = createBrowserLambdaApi();

    const path = await api.showOpenDialog();

    expect(inputClick).toHaveBeenCalled();
    expect(path).toBe('fallback.fountain');
    await expect(api.readFile('fallback.fountain')).resolves.toBe(
      'Fallback line\n',
    );

    const anchorClick = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          click: anchorClick,
          download: '',
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    });

    await api.writeFile('fallback.fountain', 'Saved fallback\n');

    expect(anchorClick).toHaveBeenCalled();
  });
});
