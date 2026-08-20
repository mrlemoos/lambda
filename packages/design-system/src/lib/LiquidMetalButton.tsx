import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type LiquidMetalButtonShape = 'pill' | 'circle';

export type LiquidMetalButtonProps = {
  shape?: LiquidMetalButtonShape;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function LiquidMetalButton({
  shape = 'pill',
  className,
  type = 'button',
  children,
  ...props
}: LiquidMetalButtonProps) {
  const classNames = [
    'lm-button',
    shape === 'circle' ? 'lm-button-circle' : 'lm-button-pill',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}
