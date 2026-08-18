import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { useForm } from './useForm.js';

describe('useForm', () => {
  it('returns a react-hook-form instance resolved from a Zod schema', () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const { result } = renderHook(() => useForm({ schema }));

    expect(result.current.handleSubmit).toEqual(expect.any(Function));
    expect(result.current.register).toEqual(expect.any(Function));
  });
});
