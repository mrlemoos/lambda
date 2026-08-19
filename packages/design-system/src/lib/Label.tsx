import { cn } from '@lambda/css';
import type { LabelHTMLAttributes } from 'react';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    // Callers associate via htmlFor or by wrapping a control; this primitive only renders the label.
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      className={cn('flex flex-col gap-1 text-sm', className)}
      {...props}
      data-slot="label"
    />
  );
}
