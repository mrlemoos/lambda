import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WindowDragRegion } from '../components/WindowDragRegion';
import {
  ScriptSessionProvider,
  useScriptSession,
} from './ScriptSessionContext';

function SessionHarness() {
  const session = useScriptSession();

  return (
    <>
      <WindowDragRegion fileName={session.fileName} />
      <button type="button" onClick={() => void session.openScriptFromDisk()}>
        Open
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
