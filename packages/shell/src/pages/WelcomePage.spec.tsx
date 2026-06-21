import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WelcomePage } from './WelcomePage.js';

const session = vi.hoisted(() => ({
  startNewScript: vi.fn(async () => undefined),
  openScriptFromDisk: vi.fn(async () => undefined),
  openScriptFromLibrary: vi.fn(async () => undefined),
  deleteLibraryScript: vi.fn(async () => undefined),
  refreshLibrary: vi.fn(async () => undefined),
  libraryEntries: [] as Array<{
    id: string;
    displayName: string;
    updatedAtMs: number;
  }>,
  openError: null as string | null,
  clearOpenError: vi.fn(),
}));

vi.mock('../session/ScriptSessionContext.js', () => ({
  useScriptSession: () => session,
}));

describe('WelcomePage', () => {
  beforeEach(() => {
    session.openError = null;
    session.libraryEntries = [];
    vi.clearAllMocks();
  });

  it('renders primary actions without footer shortcut hints', () => {
    const { container } = render(<WelcomePage />);

    expect(container.querySelector('.welcome-logo')).not.toBeNull();
    expect(screen.queryByText('Offline screenwriting')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Lambda' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'New script' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Open…' })).not.toBeNull();
    expect(container.querySelector('.welcome-shortcuts')).toBeNull();
  });

  it('shows open errors with dismiss control', () => {
    session.openError = 'Could not open this file.';

    render(<WelcomePage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not open this file.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(session.clearOpenError).toHaveBeenCalled();
    session.openError = null;
  });

  it('lists local library entries when present', () => {
    session.libraryEntries = [
      {
        id: 'abc',
        displayName: 'JULIE',
        updatedAtMs: Date.parse('2026-06-20T10:00:00.000Z'),
      },
    ];

    render(<WelcomePage />);

    expect(
      screen.getByRole('region', { name: 'Local script library' }),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: /JULIE ·/i })).not.toBeNull();
    session.libraryEntries = [];
  });
});
