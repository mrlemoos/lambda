import { cn } from '@lambda/css';
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
  return (
    <button
      type={type}
      className={cn(
        'lm-button',
        shape === 'circle' ? 'lm-button-circle' : 'lm-button-pill',
        className,
      )}
      {...props}
      data-slot="button"
    >
      {children}
    </button>
  );
}
