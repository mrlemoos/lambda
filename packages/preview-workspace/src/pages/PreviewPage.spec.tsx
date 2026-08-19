import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PreviewPage } from './PreviewPage.js';

const session = vi.hoisted(() => ({
  script: {
    titlePage: ['Title: Night Shift'],
    document: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. ROOM - DAY' }],
        },
      ],
    },
  },
  pageFormat: 'us-letter' as const,
  typeface: 'courier-prime' as const,
  openExportSettingsDialog: vi.fn(),
  exportPdf: vi.fn(async () => undefined),
}));

vi.mock('@lambda/print', () => ({
  ScriptPreviewView: () => <div data-testid="script-preview-view" />,
}));

vi.mock('@lambda/script-session', () => ({
  useScriptSession: () => session,
}));

describe('PreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.script = {
      titlePage: ['Title: Night Shift'],
      document: {
        type: 'doc',
        content: [
          {
            type: 'sceneHeading',
            content: [{ type: 'text', text: 'INT. ROOM - DAY' }],
          },
        ],
      },
    };
  });

  it('renders preview toolbar actions when a script is open', () => {
    render(<PreviewPage />);

    expect(screen.getByRole('link', { name: '← Back' })).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Export settings…' }),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Export PDF' })).not.toBeNull();
    expect(screen.getByTestId('script-preview-view')).not.toBeNull();
  });
});
