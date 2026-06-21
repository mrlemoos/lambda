import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TitlePageDialog } from './TitlePageDialog';

describe('TitlePageDialog', () => {
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
