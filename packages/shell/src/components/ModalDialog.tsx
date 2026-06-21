import { Dialog } from '@base-ui/react/dialog';
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
  const popupClassNames = ['modal-dialog', popupClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-dialog-backdrop" />
        <Dialog.Popup className={popupClassNames}>{children}</Dialog.Popup>
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
  return <Dialog.Title className={className}>{children}</Dialog.Title>;
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
    <Dialog.Description className={className}>{children}</Dialog.Description>
  );
}
