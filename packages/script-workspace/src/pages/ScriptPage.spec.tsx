import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ScriptPage } from './ScriptPage.js';

vi.mock('@lambda/editor', () => ({
  ScriptEditorSurface: () => <div data-testid="script-editor-surface" />,
}));

vi.mock('@lambda/editor-zoom', () => ({
  EditorZoomSurface: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useEditorZoom: () => ({ level: 100 }),
}));

vi.mock('../components/ScriptToolbar.js', () => ({
  ScriptToolbar: () => <div>Toolbar</div>,
}));

const session = vi.hoisted(() => ({
  script: {
    document: { type: 'doc', content: [] },
    titlePage: [] as string[],
  } as {
    document: { type: string; content: unknown[] };
    titlePage: string[];
  } | null,
  editorSessionKey: 1,
  pageFormat: 'us-letter' as const,
  typeface: 'courier-prime' as const,
  fileName: 'Untitled',
  dirty: false,
  updateDocument: vi.fn(),
  confirmUnsavedChanges: vi.fn(async () => 'discard' as const),
  openTitlePageDialog: vi.fn(),
  openPreview: vi.fn(),
}));

vi.mock('@lambda/script-session', () => ({
  useScriptSession: () => session,
}));

describe('ScriptPage', () => {
  it('renders the script workspace when a script is open', () => {
    render(<ScriptPage />);

    const result = screen.getByText('Toolbar');

    expect(result).not.toBeNull();
    expect(screen.getByTestId('script-editor-surface')).not.toBeNull();
  });
});
