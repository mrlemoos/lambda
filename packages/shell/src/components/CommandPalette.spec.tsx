import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatPlatformShortcut } from '../lib/platformShortcuts.js';
import { CommandPalette, CommandPaletteHost } from './CommandPalette.js';

const session = vi.hoisted(() => ({
  script: null as { titlePage: string[] } | null,
  startNewScript: vi.fn(async () => undefined),
  openScriptFromDisk: vi.fn(async () => undefined),
  openTitlePageDialog: vi.fn(),
  openPreview: vi.fn(),
}));

vi.mock('../session/ScriptSessionContext.js', () => ({
  useScriptSession: () => ({
    script: session.script,
    startNewScript: session.startNewScript,
    openScriptFromDisk: session.openScriptFromDisk,
    openTitlePageDialog: session.openTitlePageDialog,
    openPreview: session.openPreview,
  }),
}));

function renderOpenPalette() {
  const onOpenChange = vi.fn();

  render(<CommandPalette open={true} onOpenChange={onOpenChange} />);

  return { onOpenChange };
}

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.script = null;
  });

  it('lists general commands with keyboard shortcuts', () => {
    renderOpenPalette();

    expect(screen.getByPlaceholderText('Type a command…')).not.toBeNull();
    expect(screen.getByText('New script')).not.toBeNull();
    expect(screen.getByText('Open…')).not.toBeNull();
    expect(
      screen.getByText(formatPlatformShortcut('CmdOrCtrl+N')),
    ).not.toBeNull();
    expect(
      screen.getByText(formatPlatformShortcut('CmdOrCtrl+O')),
    ).not.toBeNull();
  });

  it('runs startNewScript when New script is selected', async () => {
    const { onOpenChange } = renderOpenPalette();

    fireEvent.click(screen.getByText('New script'));

    await waitFor(() => {
      expect(session.startNewScript).toHaveBeenCalledOnce();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('runs openScriptFromDisk when Open is selected', async () => {
    const { onOpenChange } = renderOpenPalette();

    fireEvent.click(screen.getByText('Open…'));

    await waitFor(() => {
      expect(session.openScriptFromDisk).toHaveBeenCalledOnce();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('lists title page when a script is open', () => {
    session.script = { titlePage: ['Title:'] };

    renderOpenPalette();

    expect(screen.getByText('Title Page…')).not.toBeNull();
  });

  it('runs openTitlePageDialog when Title Page is selected', async () => {
    session.script = { titlePage: ['Title:'] };
    const { onOpenChange } = renderOpenPalette();

    fireEvent.click(screen.getByText('Title Page…'));

    await waitFor(() => {
      expect(session.openTitlePageDialog).toHaveBeenCalledOnce();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('lists preview when a script is open', () => {
    session.script = { titlePage: [] };

    renderOpenPalette();

    expect(screen.getByText('Preview…')).not.toBeNull();
  });

  it('runs openPreview when Preview is selected', async () => {
    session.script = { titlePage: [] };
    const { onOpenChange } = renderOpenPalette();

    fireEvent.click(screen.getByText('Preview…'));

    await waitFor(() => {
      expect(session.openPreview).toHaveBeenCalledOnce();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('CommandPaletteHost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens on CmdOrCtrl+K', () => {
    render(<CommandPaletteHost />);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(screen.getByPlaceholderText('Type a command…')).not.toBeNull();
  });
});
