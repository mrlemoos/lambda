'use client';

import { createLambdaAuthClient } from '@lambda/auth';
import { Input, Label, LiquidMetalButton } from '@lambda/design-system';
import { Form, FormField, useForm } from '@lambda/form';
import { z } from 'zod';

import { AuthScreenLayout } from './AuthScreenLayout.js';
import { authLinkClassName, type AuthLinkComponent } from './authLink.js';
import { PasswordField } from './PasswordField.js';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInFormProps = {
  authClient?: ReturnType<typeof createLambdaAuthClient>;
  onSignedIn?: () => void;
  Link?: AuthLinkComponent;
};

export function SignInForm({
  authClient = createLambdaAuthClient(),
  onSignedIn,
  Link = 'a',
}: SignInFormProps) {
  const form = useForm({ schema: signInSchema });

  return (
    <AuthScreenLayout>
      <Form
        className="flex w-full max-w-sm flex-col justify-center gap-4"
        form={form}
        onSubmit={async (values) => {
          const result = await authClient.signIn.email({
            email: values.email,
            password: values.password,
          });

          if (result.error) {
            form.setError('root', { message: result.error.message });
            return;
          }

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
            <PasswordField
              name={field.name}
              value={(field.value as string | undefined) ?? ''}
              autoComplete="current-password"
              onChange={field.onChange}
              onBlur={field.onBlur}
              fieldRef={field.ref}
              error={field.error}
            />
          )}
        </FormField>
        {form.formState.errors.root?.message ? (
          <p className="ui-alert ui-alert-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- primary action on auth screen */}
        <LiquidMetalButton type="submit" autoFocus>
          Sign in
        </LiquidMetalButton>
        <p className="ui-hint">
          Need an account?{' '}
          <Link className={authLinkClassName} href="/sign-up">
            Create account
          </Link>
        </p>
      </Form>
    </AuthScreenLayout>
  );
}
