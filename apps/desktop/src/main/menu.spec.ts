import { describe, expect, it } from 'vitest';

import { createApplicationMenuTemplate } from './menu.js';

describe('createApplicationMenuTemplate', () => {
  it('includes standard edit menu commands', () => {
    const template = createApplicationMenuTemplate({
      appName: 'Lambda',
      isMac: false,
      sendFileCommand: () => undefined,
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
});
