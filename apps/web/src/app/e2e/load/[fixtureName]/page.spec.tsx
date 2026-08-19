import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../e2e/E2eLoadPage.js', () => ({
  E2eLoadPage: () => <p>Loading fixture…</p>,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ fixtureName: 'night-shift' }),
}));

describe('E2eLoadRoute', () => {
  it('renders the fixture loader', async () => {
    const { default: E2eLoadRoute } = await import('./page.js');

    render(<E2eLoadRoute />);

    const result = screen.getByText('Loading fixture…');

    expect(result).toBeInTheDocument();
  });
});
