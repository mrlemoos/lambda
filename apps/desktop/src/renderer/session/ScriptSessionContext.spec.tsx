import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ScriptSessionProvider,
  useScriptSession,
} from './ScriptSessionContext';
import { WindowDragRegion } from '../components/WindowDragRegion';

function SessionHarness() {
  const session = useScriptSession();

  return (
    <>
      <WindowDragRegion fileName={session.fileName} />
      <button type="button" onClick={() => void session.openScriptFromDisk()}>
        Open
      </button>
      <button
        type="button"
        onClick={() =>
          session.updateDocument({
            type: 'doc',
            content: [
              {
                type: 'action',
                content: [{ type: 'text', text: 'Existing line plus more' }],
              },
            ],
          })
        }
      >
        Edit
      </button>
      <button type="button" onClick={() => void session.saveScript()}>
        Save
      </button>
    </>
  );
}

describe('ScriptSessionProvider', () => {
  beforeEach(() => {
    window.lambda = {
      platform: 'linux',
      onFileCommand: vi.fn(() => () => undefined),
      readFile: vi.fn(async () => 'Existing line\n'),
      writeFile: vi.fn(async (filePath) => filePath),
      showOpenDialog: vi.fn(async () => '/tmp/existing.fountain'),
      showSaveDialog: vi.fn(async () => '/tmp/existing.fountain'),
      setWindowTitle: vi.fn(async () => undefined),
    };
  });

  it('saves the latest document after an immediate edit', async () => {
    render(
      <MemoryRouter>
        <ScriptSessionProvider>
          <SessionHarness />
        </ScriptSessionProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      expect(window.lambda.readFile).toHaveBeenCalledWith(
        '/tmp/existing.fountain',
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(window.lambda.writeFile).toHaveBeenCalledWith(
        '/tmp/existing.fountain',
        'Existing line plus more\n',
      );
    });
  });

  it('shows the opened filename in the window drag region', async () => {
    window.lambda.platform = 'darwin';

    render(
      <MemoryRouter>
        <ScriptSessionProvider>
          <SessionHarness />
        </ScriptSessionProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByText('existing.fountain')).not.toBeNull();
  });
});
