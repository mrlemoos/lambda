'use client';

import { Dialog } from '@base-ui/react/dialog';
import { cn } from '@lambda/css';
import type { ReactNode } from 'react';

export type ModalDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  popupClassName?: string;
  children: ReactNode;
};

export function ModalDialog({
  open,
  onOpenChange,
  popupClassName,
  children,
}: ModalDialogProps) {
  return (
    <Dialog.Root data-slot="dialog" open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal data-slot="dialog-portal">
        <Dialog.Backdrop
          data-slot="dialog-overlay"
          className="fixed inset-0 z-[1000] min-h-dvh bg-[var(--modal-backdrop)]"
        />
        <Dialog.Popup
          data-slot="dialog-content"
          className={cn(
            'fixed top-1/2 left-1/2 z-[1001] m-0 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--modal-border)] bg-[var(--modal-bg)] p-5 text-inherit shadow-[0_18px_48px_rgb(0_0_0_/_0.18)] outline-none backdrop-blur-[var(--glass-blur)]',
            popupClassName,
          )}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type ModalDialogTitleProps = {
  className?: string;
  children: ReactNode;
};

export function ModalDialogTitle({
  className,
  children,
}: ModalDialogTitleProps) {
  return (
    <Dialog.Title data-slot="dialog-title" className={className}>
      {children}
    </Dialog.Title>
  );
}

export type ModalDialogDescriptionProps = {
  className?: string;
  children: ReactNode;
};

export function ModalDialogDescription({
  className,
  children,
}: ModalDialogDescriptionProps) {
  return (
    <Dialog.Description data-slot="dialog-description" className={className}>
      {children}
    </Dialog.Description>
  );
}
