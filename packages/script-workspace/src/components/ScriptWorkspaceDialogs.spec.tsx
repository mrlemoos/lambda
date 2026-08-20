import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ScriptWorkspaceDialogs } from './ScriptWorkspaceDialogs.js';

const session = vi.hoisted(() => ({
  script: { titlePage: ['Title: Night'] },
  pageFormat: 'us-letter' as const,
  typeface: 'courier-prime' as const,
  titlePageDialogOpen: false,
  titlePageDialogInitialData: null as { title: string[] } | null,
  saveTitlePage: vi.fn(),
  closeTitlePageDialog: vi.fn(),
  exportSettingsDialogOpen: false,
  saveExportSettings: vi.fn(),
  closeExportSettingsDialog: vi.fn(),
}));

vi.mock('@lambda/script-session', () => ({
  useScriptSession: () => session,
}));

vi.mock('./TitlePageDialog.js', () => ({
  TitlePageDialog: () => <div>Title Page</div>,
}));

vi.mock('./ExportSettingsDialog.js', () => ({
  ExportSettingsDialog: () => <div>Export settings</div>,
}));

describe('ScriptWorkspaceDialogs', () => {
  it('renders the title page dialog when session state is open', () => {
    session.titlePageDialogOpen = true;
    session.titlePageDialogInitialData = { title: ['Night'] };

    const result = render(<ScriptWorkspaceDialogs />);

    expect(result.getByText('Title Page')).not.toBeNull();
    expect(screen.queryByText('Export settings')).toBeNull();
  });
});
