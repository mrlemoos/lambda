import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ModalDialog,
  ModalDialogDescription,
  ModalDialogTitle,
} from './ModalDialog.js';

describe('ModalDialog', () => {
  it('renders a centred modal popup with shared shell styles', () => {
    render(
      <ModalDialog open popupClassName="modal-dialog--unsaved">
        <ModalDialogTitle>Save changes?</ModalDialogTitle>
        <ModalDialogDescription>
          Unsaved work will be lost.
        </ModalDialogDescription>
      </ModalDialog>,
    );

    const result = screen.getByRole('dialog');

    expect(result).toHaveClass('fixed');
    expect(result).not.toHaveClass('modal-dialog');
    expect(result).toHaveClass('modal-dialog--unsaved');
    expect(result).toHaveAttribute('data-slot', 'dialog-content');
    expect(
      document.querySelector('[data-slot="dialog-overlay"]'),
    ).not.toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Save changes?' }),
    ).toHaveAttribute('data-slot', 'dialog-title');
    expect(screen.getByText('Unsaved work will be lost.')).toHaveAttribute(
      'data-slot',
      'dialog-description',
    );
  });
});
