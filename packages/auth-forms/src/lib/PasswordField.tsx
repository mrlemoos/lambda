'use client';

import { Input, Label } from '@lambda/design-system';
import { useId, useState } from 'react';

export type PasswordFieldProps = {
  name: string;
  value: string;
  autoComplete: string;
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  fieldRef: (instance: HTMLInputElement | HTMLTextAreaElement | null) => void;
  error?: string;
};

export function PasswordField({
  name,
  value,
  autoComplete,
  onChange,
  onBlur,
  fieldRef,
  error,
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <Label htmlFor={id}>Password</Label>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={fieldRef}
      >
        <button
          type="button"
          className="mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--text-subtle)]"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => {
            setVisible((current) => !current);
          }}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </Input>
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 1 0 2.8 2.8" />
      <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16.9 16.9 0 0 1-3.2 4.4" />
      <path d="M6.1 6.1A16.8 16.8 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.4-1" />
    </svg>
  );
}
