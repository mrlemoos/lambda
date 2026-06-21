import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LambdaApi } from '../lib/api.js';
import { WindowDragRegion } from '../components/WindowDragRegion.js';
import { LambdaApiProvider } from '../session/LambdaApiContext.js';
import {
  ScriptSessionProvider,
  useScriptSession,
} from '../session/ScriptSessionContext.js';

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
  let api: LambdaApi;

  beforeEach(() => {
    api = {
      platform: 'linux',
      onFileCommand: vi.fn(() => () => undefined),
      onViewCommand: vi.fn(() => () => undefined),
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
        <LambdaApiProvider api={api}>
          <ScriptSessionProvider>
            <SessionHarness />
          </ScriptSessionProvider>
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      expect(api.readFile).toHaveBeenCalledWith('/tmp/existing.fountain');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.writeFile).toHaveBeenCalledWith(
        '/tmp/existing.fountain',
        `Existing line plus more

{{Slugline Document Settings
Page Format: US Letter
Typeface: Courier Prime
}}
`,
      );
    });
  });

  it('shows the opened filename in the window drag region', async () => {
    api.platform = 'darwin';

    render(
      <MemoryRouter>
        <LambdaApiProvider api={api}>
          <ScriptSessionProvider>
            <SessionHarness />
          </ScriptSessionProvider>
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByText('existing.fountain')).not.toBeNull();
  });

  it('persists slugline document settings when saving', async () => {
    api.readFile = vi.fn(async () => 'INT. KITCHEN - DAY\n');

    render(
      <MemoryRouter>
        <LambdaApiProvider api={api}>
          <ScriptSessionProvider>
            <SessionHarness />
          </ScriptSessionProvider>
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      expect(api.readFile).toHaveBeenCalledWith('/tmp/existing.fountain');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.writeFile).toHaveBeenCalledWith(
        '/tmp/existing.fountain',
        `INT. KITCHEN - DAY

{{Slugline Document Settings
Page Format: US Letter
Typeface: Courier Prime
}}
`,
      );
    });
  });

  it('persists updated export settings when saving', async () => {
    api.readFile = vi.fn(async () => 'INT. KITCHEN - DAY\n');

    function ExportSettingsHarness() {
      const session = useScriptSession();

      return (
        <>
          <button
            type="button"
            onClick={() => void session.openScriptFromDisk()}
          >
            Open
          </button>
          <button type="button" onClick={() => session.updatePageFormat('a4')}>
            Set A4
          </button>
          <button type="button" onClick={() => void session.saveScript()}>
            Save
          </button>
        </>
      );
    }

    render(
      <MemoryRouter>
        <LambdaApiProvider api={api}>
          <ScriptSessionProvider>
            <ExportSettingsHarness />
          </ScriptSessionProvider>
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      expect(api.readFile).toHaveBeenCalledWith('/tmp/existing.fountain');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set A4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.writeFile).toHaveBeenCalledWith(
        '/tmp/existing.fountain',
        `INT. KITCHEN - DAY

{{Slugline Document Settings
Page Format: A4
Typeface: Courier Prime
}}
`,
      );
    });
  });

  it('delegates exportPdf to the platform api', async () => {
    api.exportPdf = vi.fn(async () => undefined);
    api.readFile = vi.fn(async () => 'INT. ROOM - DAY\n');

    function ExportHarness() {
      const session = useScriptSession();

      return (
        <>
          <button
            type="button"
            onClick={() => void session.openScriptFromDisk()}
          >
            Open
          </button>
          <button type="button" onClick={() => void session.exportPdf()}>
            Export PDF
          </button>
        </>
      );
    }

    render(
      <MemoryRouter>
        <LambdaApiProvider api={api}>
          <ScriptSessionProvider>
            <ExportHarness />
          </ScriptSessionProvider>
        </LambdaApiProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      expect(api.readFile).toHaveBeenCalledWith('/tmp/existing.fountain');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));

    await waitFor(() => {
      expect(api.exportPdf).toHaveBeenCalledWith({
        pageFormat: 'us-letter',
        defaultName: 'existing.pdf',
      });
    });
  });
});
