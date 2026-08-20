'use client';

import { createLambdaAuthClient } from '@lambda/auth';
import { LiquidMetalButton } from '@lambda/design-system';
import { Form, FormField, useForm } from '@lambda/form';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInFormProps = {
  authClient?: ReturnType<typeof createLambdaAuthClient>;
  onSignedIn?: () => void;
};

export function SignInForm({
  authClient = createLambdaAuthClient(),
  onSignedIn,
}: SignInFormProps) {
  const form = useForm({ schema: signInSchema });

  return (
    <Form
      className="auth-form"
      form={form}
      onSubmit={async (values) => {
        await authClient.signIn.email({
          email: values.email,
          password: values.password,
        });
        onSignedIn?.();
      }}
    >
      <h1 className="ui-heading">Sign in</h1>
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
              autoComplete="current-password"
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
      <LiquidMetalButton type="submit">Sign in</LiquidMetalButton>
    </Form>
  );
}
