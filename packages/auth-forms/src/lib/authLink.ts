import type { ElementType, ReactNode } from 'react';

export type AuthLinkComponent = ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
}>;

export const authLinkClassName = 'text-primary underline underline-offset-2';
