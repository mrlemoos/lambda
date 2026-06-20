import { describe, expect, it } from 'vitest';

import { createApplicationMenuTemplate } from './menu.js';

describe('createApplicationMenuTemplate', () => {
  it('includes standard edit menu commands', () => {
    const template = createApplicationMenuTemplate({
      appName: 'Lambda',
      isMac: false,
      sendFileCommand: () => undefined,
      sendViewCommand: () => undefined,
    });

    const editMenu = template.find((item) => item.label === 'Edit');

    expect(editMenu?.submenu).toMatchObject([
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ]);
  });

  it('includes view zoom commands', () => {
    const template = createApplicationMenuTemplate({
      appName: 'Lambda',
      isMac: false,
      sendFileCommand: () => undefined,
      sendViewCommand: () => undefined,
    });

    const viewMenu = template.find((item) => item.label === 'View');

    expect(viewMenu?.submenu).toMatchObject([
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+=' },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-' },
      { type: 'separator' },
      { label: 'Actual Size', accelerator: 'CmdOrCtrl+0' },
    ]);
  });
});
