import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ScriptToolbar } from './ScriptToolbar.js';

describe('ScriptToolbar', () => {
  it('shows the filename and edited badge when dirty', () => {
    const onBack = vi.fn(async () => 'discard' as const);

    render(
      <MemoryRouter>
        <ScriptToolbar fileName="night-shift.fountain" dirty onBack={onBack} />
      </MemoryRouter>,
    );

    expect(screen.getByText('night-shift.fountain')).not.toBeNull();
    expect(screen.getByText('Edited')).not.toBeNull();
  });

  it('hides the edited badge when the script is saved', () => {
    const onBack = vi.fn(async () => 'discard' as const);

    render(
      <MemoryRouter>
        <ScriptToolbar
          fileName="night-shift.fountain"
          dirty={false}
          onBack={onBack}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Edited')).toBeNull();
  });

  it('calls onBack when the welcome link is clicked', async () => {
    const onBack = vi.fn(async () => 'cancel' as const);

    render(
      <MemoryRouter>
        <ScriptToolbar fileName="night-shift.fountain" dirty onBack={onBack} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: /welcome/i }));

    await waitFor(() => {
      expect(onBack).toHaveBeenCalledOnce();
    });
  });
});
