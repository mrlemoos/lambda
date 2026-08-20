'use client';

import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import type { FormEventHandler, ReactNode } from 'react';

export type FormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
};

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<TFieldValues>) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    void form.handleSubmit(onSubmit)(event);
  };

  return (
    <FormProvider {...form}>
      <form className={className} onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}
