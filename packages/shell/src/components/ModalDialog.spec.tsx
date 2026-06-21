import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModalDialog } from './ModalDialog.js';

describe('ModalDialog', () => {
  it('renders a centred modal popup with shared shell styles', () => {
    render(
      <ModalDialog open popupClassName="modal-dialog--unsaved">
        <p>Save changes?</p>
      </ModalDialog>,
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveClass('modal-dialog');
    expect(dialog).toHaveClass('modal-dialog--unsaved');
  });
});
