import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { Form } from './Form.js';
import { FormField } from './FormField.js';
import { useForm } from './useForm.js';

const schema = z.object({
  email: z.string().min(1, 'Email is required'),
});

function EmailForm({
  onSubmit,
}: {
  onSubmit: (values: { email: string }) => void;
}) {
  const form = useForm({ schema });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField name="email">
        {(field) => (
          <label>
            Email
            <input
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span>{field.error}</span> : null}
          </label>
        )}
      </FormField>
      <button type="submit">Continue</button>
    </Form>
  );
}

describe('FormField', () => {
  it('submits values from the named field', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EmailForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { email: 'ada@example.com' },
      expect.anything(),
    );
  });
});
