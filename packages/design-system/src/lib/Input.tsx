import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, children, ...props },
  ref,
) {
  return (
    <span className="lm-field" data-slot="input-field">
      <input ref={ref} className={className} {...props} data-slot="input" />
      {children}
    </span>
  );
});
