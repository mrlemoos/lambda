'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm as useReactHookForm,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

export type UseFormOptions<TSchema extends z.ZodType> = {
  schema: TSchema;
};

export function useForm<TSchema extends z.ZodType>({
  schema,
}: UseFormOptions<TSchema>): UseFormReturn<z.infer<TSchema> & FieldValues> {
  return useReactHookForm<z.infer<TSchema> & FieldValues>({
    resolver: zodResolver(schema),
  });
}
