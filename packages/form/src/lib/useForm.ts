'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm as useReactHookForm,
  type FieldValues,
  type Resolver,
} from 'react-hook-form';
import type { z } from 'zod';

export type UseFormOptions<TSchema extends z.ZodType<FieldValues>> = {
  schema: TSchema;
};

export function useForm<TSchema extends z.ZodType<FieldValues>>({
  schema,
}: UseFormOptions<TSchema>) {
  const resolver = zodResolver(schema as never) as Resolver<z.output<TSchema>>;

  return useReactHookForm<z.output<TSchema>>({
    resolver,
  });
}
