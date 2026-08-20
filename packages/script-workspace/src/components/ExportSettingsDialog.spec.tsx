import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExportSettingsDialog } from './ExportSettingsDialog.js';

describe('ExportSettingsDialog', () => {
  it('saves selected page format and typeface', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <ExportSettingsDialog
        open
        pageFormat="us-letter"
        typeface="courier-prime"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText('Page format'), {
      target: { value: 'a4' },
    });
    fireEvent.change(screen.getByLabelText('Typeface'), {
      target: { value: 'courier-new' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({
      pageFormat: 'a4',
      typeface: 'courier-new',
    });
  });
});
