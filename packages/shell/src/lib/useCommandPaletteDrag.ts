import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export const COMMAND_PALETTE_DIALOG_CLASS = 'command-palette-dialog';

type PalettePosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export function dragPositionFromPointer(
  dragState: DragState,
  clientX: number,
  clientY: number,
): PalettePosition {
  return {
    x: dragState.originX + (clientX - dragState.startX),
    y: dragState.originY + (clientY - dragState.startY),
  };
}

function centreDialog(dialog: HTMLElement) {
  dialog.style.left = '50%';
  dialog.style.top = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
}

function positionDialog(dialog: HTMLElement, position: PalettePosition) {
  dialog.style.left = `${position.x}px`;
  dialog.style.top = `${position.y}px`;
  dialog.style.transform = 'none';
}

function applyDialogPosition(
  position: PalettePosition | null,
  dialogRef: { current: HTMLElement | null },
) {
  const dialog = document.querySelector<HTMLElement>(
    `.${COMMAND_PALETTE_DIALOG_CLASS}`,
  );

  if (!dialog) {
    return false;
  }

  dialogRef.current = dialog;

  if (position) {
    positionDialog(dialog, position);
  } else {
    centreDialog(dialog);
  }

  return true;
}

export function useCommandPaletteDrag(open: boolean) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [position, setPosition] = useState<PalettePosition | null>(null);

  useEffect(() => {
    if (!open) {
      dragStateRef.current = null;
      dialogRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const syncPosition = () => {
      if (cancelled) {
        return;
      }

      if (applyDialogPosition(position, dialogRef)) {
        return;
      }

      requestAnimationFrame(syncPosition);
    };

    syncPosition();

    return () => {
      cancelled = true;
    };
  }, [open, position]);

  const dragHandleProps = {
    'aria-label': 'Move command palette',
    className: 'command-palette-drag-handle',
    role: 'button' as const,
    tabIndex: -1,
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      if ((event.button ?? 0) !== 0) {
        return;
      }

      const dialog =
        dialogRef.current ??
        document.querySelector<HTMLElement>(`.${COMMAND_PALETTE_DIALOG_CLASS}`);

      if (!dialog) {
        return;
      }

      dialogRef.current = dialog;

      const rect = dialog.getBoundingClientRect();

      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: rect.left,
        originY: rect.top,
      };

      setPosition({ x: rect.left, y: rect.top });

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dragState = dragStateRef.current;

        if (!dragState || moveEvent.pointerId !== dragState.pointerId) {
          return;
        }

        setPosition(
          dragPositionFromPointer(
            dragState,
            moveEvent.clientX,
            moveEvent.clientY,
          ),
        );
      };

      const endDrag = (endEvent: PointerEvent) => {
        const dragState = dragStateRef.current;

        if (!dragState || endEvent.pointerId !== dragState.pointerId) {
          return;
        }

        dragStateRef.current = null;
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', endDrag);
        document.removeEventListener('pointercancel', endDrag);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', endDrag);
      document.addEventListener('pointercancel', endDrag);
      event.preventDefault();
    },
  };

  return { dragHandleProps };
}
