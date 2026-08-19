import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/script-workspace', () => ({
  ScriptPage: () => <div>Script</div>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../lambda-web/WritingAccessProvider.js', () => ({
  useWritingAccess: () => ({
    writingAccess: 'write',
    hasSession: true,
    isPending: false,
  }),
}));

describe('ScriptRoute', () => {
  it('renders the script workspace', async () => {
    const { default: ScriptRoute } = await import('./page.js');

    render(<ScriptRoute />);

    const result = screen.getByText('Script');

    expect(result).toBeInTheDocument();
  });
});
