'use client';

import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import type { ReactNode } from 'react';

export type FormFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  children: (field: {
    name: FieldPath<TFieldValues>;
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    ref: (instance: HTMLInputElement | HTMLTextAreaElement | null) => void;
    error?: string;
  }) => ReactNode;
};

export function FormField<TFieldValues extends FieldValues>({
  name,
  children,
}: FormFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          {children({
            ...field,
            error: fieldState.error?.message,
          })}
        </>
      )}
    />
  );
}
