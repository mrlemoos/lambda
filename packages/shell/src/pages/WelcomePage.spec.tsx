import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WelcomePage } from './WelcomePage.js';

const session = vi.hoisted(() => ({
  startNewScript: vi.fn(async () => undefined),
  openScriptFromDisk: vi.fn(async () => undefined),
  openError: null as string | null,
  clearOpenError: vi.fn(),
}));

vi.mock('../session/ScriptSessionContext.js', () => ({
  useScriptSession: () => session,
}));

describe('WelcomePage', () => {
  beforeEach(() => {
    session.openError = null;
    vi.clearAllMocks();
  });

  it('renders primary actions and keyboard hints', () => {
    render(<WelcomePage />);

    expect(screen.getByRole('heading', { name: 'Lambda' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'New script' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Open…' })).not.toBeNull();
    expect(screen.getByText(/new · .* open · .* save/i)).not.toBeNull();
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
});
