import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { Form } from './Form.js';
import { useForm } from './useForm.js';

const schema = z.object({
  title: z.string(),
});

function TitleForm({
  onSubmit,
}: {
  onSubmit: (values: { title: string }) => void;
}) {
  const form = useForm({ schema });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <label>
        Title
        <input {...form.register('title')} />
      </label>
      <button type="submit">Save</button>
    </Form>
  );
}

describe('Form', () => {
  it('submits values through the Planria-shaped form wrapper', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TitleForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Title'), 'Night');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const result = onSubmit.mock.calls[0]?.[0];

    expect(result).toEqual({ title: 'Night' });
  });
});
