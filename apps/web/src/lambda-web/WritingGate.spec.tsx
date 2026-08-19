import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const writingAccessState = vi.hoisted(() => ({
  writingAccess: 'write' as 'write' | 'sign-in-wall' | 'offline-blocked',
  hasSession: true,
  isPending: false,
}));

const router = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock('./WritingAccessProvider.js', () => ({
  useWritingAccess: () => writingAccessState,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/script',
}));

describe('WritingGate', () => {
  beforeEach(() => {
    writingAccessState.writingAccess = 'write';
    writingAccessState.hasSession = true;
    writingAccessState.isPending = false;
    router.replace.mockReset();
  });

  it('shows children when writing is allowed', async () => {
    const { WritingGate } = await import('./WritingGate.js');

    render(
      <WritingGate>
        <p>Editor</p>
      </WritingGate>,
    );

    const result = screen.getByText('Editor');

    expect(result).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('hides the editor and replaces to sign-in when the wall is up', async () => {
    writingAccessState.writingAccess = 'sign-in-wall';
    writingAccessState.hasSession = false;
    const { WritingGate } = await import('./WritingGate.js');

    render(
      <WritingGate>
        <p>Editor</p>
      </WritingGate>,
    );

    const result = screen.queryByText('Editor');

    expect(result).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith('/sign-in');
  });
});
