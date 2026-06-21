import { newScriptStub, parseFountain } from '@lambda/fountain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TitlePageDialog } from './TitlePageDialog';
import { resolveTitlePageDialogInitialData } from '../lib/resolveTitlePageDialogInitialData.js';

describe('TitlePageDialog', () => {
  it('reloads field values when initialData changes while open', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const { rerender } = render(
      <TitlePageDialog
        open
        initialData={{ title: [] }}
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('');

    rerender(
      <TitlePageDialog
        open
        initialData={{ title: ['BRICK & STEEL'] }}
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('BRICK & STEEL');
  });

  it('renders through the shared modal dialog shell', () => {
    render(
      <TitlePageDialog
        open
        initialData={{ title: [] }}
        onSave={() => undefined}
        onCancel={() => undefined}
      />,
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveClass('modal-dialog');
    expect(dialog).toHaveClass('modal-dialog--title-page');
  });

  it('prefills stub credit when the title is seeded from the display name', () => {
    const savedText = `${newScriptStub()}INT. SUBURBIA - (1990) - NIGHT
MARIO enters.
`;
    const script = parseFountain(savedText);
    const initialData = resolveTitlePageDialogInitialData({
      script,
      savedText,
      displayName: 'Port of Ambitions',
      filePath: null,
    });

    render(
      <TitlePageDialog
        open
        initialData={initialData}
        onSave={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Port of Ambitions');
    expect(screen.getByLabelText('Credit')).toHaveValue('Written by');
  });

  it('prefills title page fields from parsed data', () => {
    render(
      <TitlePageDialog
        open
        initialData={{
          title: ['BRICK & STEEL'],
          credit: 'Written by',
          author: ['Jane Doe'],
          draftDate: '1/20/2012',
        }}
        onSave={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('BRICK & STEEL');
    expect(screen.getByLabelText('Credit')).toHaveValue('Written by');
    expect(screen.getByLabelText('Author')).toHaveValue('Jane Doe');
    expect(screen.getByLabelText('Draft date')).toHaveValue('1/20/2012');
  });

  it('emits parsed title page data when saved', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <TitlePageDialog
        open
        initialData={{ title: [] }}
        onSave={onSave}
        onCancel={() => undefined}
      />,
    );

    await user.type(screen.getByLabelText('Title'), 'TIME CHEF');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({
      title: ['TIME CHEF'],
    });
  });
});
