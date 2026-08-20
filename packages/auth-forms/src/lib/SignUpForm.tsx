'use client';

import { createLambdaAuthClient } from '@lambda/auth';
import { LiquidMetalButton } from '@lambda/design-system';
import { Form, FormField, useForm } from '@lambda/form';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpFormProps = {
  authClient?: ReturnType<typeof createLambdaAuthClient>;
  onSignedUp?: () => void;
};

export function SignUpForm({
  authClient = createLambdaAuthClient(),
  onSignedUp,
}: SignUpFormProps) {
  const form = useForm({ schema: signUpSchema });

  return (
    <Form
      className="auth-form"
      form={form}
      onSubmit={async (values) => {
        await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        onSignedUp?.();
      }}
    >
      <h1 className="ui-heading">Create account</h1>
      <FormField name="name">
        {(field) => (
          <label className="auth-form-field">
            Name
            <input
              autoComplete="name"
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span role="alert">{field.error}</span> : null}
          </label>
        )}
      </FormField>
      <FormField name="email">
        {(field) => (
          <label className="auth-form-field">
            Email
            <input
              type="email"
              autoComplete="email"
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span role="alert">{field.error}</span> : null}
          </label>
        )}
      </FormField>
      <FormField name="password">
        {(field) => (
          <label className="auth-form-field">
            Password
            <input
              type="password"
              autoComplete="new-password"
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span role="alert">{field.error}</span> : null}
          </label>
        )}
      </FormField>
      <LiquidMetalButton type="submit">Create account</LiquidMetalButton>
    </Form>
  );
}
