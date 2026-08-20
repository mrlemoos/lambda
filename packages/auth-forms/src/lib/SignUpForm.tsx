'use client';

import { createLambdaAuthClient } from '@lambda/auth';
import { Input, Label, LiquidMetalButton } from '@lambda/design-system';
import { Form, FormField, useForm } from '@lambda/form';
import { z } from 'zod';

import { AuthScreenLayout } from './AuthScreenLayout.js';
import { authLinkClassName, type AuthLinkComponent } from './authLink.js';
import { PasswordField } from './PasswordField.js';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpFormProps = {
  authClient?: ReturnType<typeof createLambdaAuthClient>;
  onSignedUp?: () => void;
  Link?: AuthLinkComponent;
};

export function SignUpForm({
  authClient = createLambdaAuthClient(),
  onSignedUp,
  Link = 'a',
}: SignUpFormProps) {
  const form = useForm({ schema: signUpSchema });

  return (
    <AuthScreenLayout>
      <Form
        className="flex w-full max-w-sm flex-col justify-center gap-4"
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
            <Label>
              Name
              <Input
                autoComplete="name"
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
            <PasswordField
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              autoComplete="new-password"
              onChange={field.onChange}
              onBlur={field.onBlur}
              fieldRef={field.ref}
              error={field.error}
            />
          )}
        </FormField>
        {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- primary action on auth screen */}
        <LiquidMetalButton type="submit" autoFocus>
          Create account
        </LiquidMetalButton>
        <p className="ui-hint">
          Already have an account?{' '}
          <Link className={authLinkClassName} href="/sign-in">
            Sign in
          </Link>
        </p>
      </Form>
    </AuthScreenLayout>
  );
}
