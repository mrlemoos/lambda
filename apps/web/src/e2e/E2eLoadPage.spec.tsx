import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lambda/script-session', () => ({
  useScriptSession: () => ({
    loadScriptFromText: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('E2eLoadPage', () => {
  it('shows a loading label while the fixture is applied', async () => {
    const { E2eLoadPage } = await import('./E2eLoadPage.js');

    render(<E2eLoadPage fixtureName="night-shift" />);

    const result = screen.getByText('Loading fixture…');

    expect(result).toBeInTheDocument();
  });
});
