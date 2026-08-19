'use client';

import { createLambdaAuthClient } from '@lambda/auth';
import { Input, Label, LiquidMetalButton } from '@lambda/design-system';
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
      className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-4 p-8"
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
          <Label>
            Email
            <Input
              type="email"
              autoComplete="email"
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span role="alert">{field.error}</span> : null}
          </Label>
        )}
      </FormField>
      <FormField name="password">
        {(field) => (
          <Label>
            Password
            <Input
              type="password"
              autoComplete="current-password"
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            {field.error ? <span role="alert">{field.error}</span> : null}
          </Label>
        )}
      </FormField>
      <LiquidMetalButton type="submit">Sign in</LiquidMetalButton>
    </Form>
  );
}
