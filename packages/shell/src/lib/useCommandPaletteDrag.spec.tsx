import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CommandPalette } from '../components/CommandPalette.js';
import {
  COMMAND_PALETTE_DIALOG_CLASS,
  dragPositionFromPointer,
} from './useCommandPaletteDrag.js';

vi.mock('../session/ScriptSessionContext.js', () => ({
  useScriptSession: () => ({
    startNewScript: vi.fn(async () => undefined),
    openScriptFromDisk: vi.fn(async () => undefined),
    openTitlePageDialog: vi.fn(),
  }),
}));

describe('dragPositionFromPointer', () => {
  it('returns the offset position from pointer movement', () => {
    const result = dragPositionFromPointer(
      {
        pointerId: 1,
        startX: 110,
        startY: 210,
        originX: 100,
        originY: 200,
      },
      130,
      230,
    );

    expect(result).toEqual({ x: 120, y: 220 });
  });
});

describe('useCommandPaletteDrag', () => {
  it('centres the dialog when opened', async () => {
    render(<CommandPalette open={true} onOpenChange={vi.fn()} />);

    const dialog = document.querySelector(
      `.${COMMAND_PALETTE_DIALOG_CLASS}`,
    ) as HTMLElement;

    expect(dialog).not.toBeNull();

    await waitFor(() => {
      expect(dialog.style.left).toBe('50%');
      expect(dialog.style.top).toBe('50%');
      expect(dialog.style.transform).toBe('translate(-50%, -50%)');
    });
  });
});
