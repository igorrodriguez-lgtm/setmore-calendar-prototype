"use client";

// EDS Modal / AlertModal / Snackbar API and the anchored popover, rendered with shadcn
// Dialog, AlertDialog, Sonner and Popover.
import { useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../shadcn/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shadcn/alert-dialog";
import { Popover, PopoverAnchor, PopoverContent } from "../../shadcn/popover";
import type { AlertModalProps, AnchoredPopoverProps, ModalPartProps, ModalProps, SnackbarProps } from "../types";

export function Modal({ open, onClose, ariaLabel, size = 640, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-h-[calc(100vh-32px)] gap-3 overflow-y-auto" style={{ maxWidth: size }} aria-describedby={undefined}>
        {ariaLabel && <DialogTitle className="sr-only">{ariaLabel}</DialogTitle>}
        {children}
      </DialogContent>
    </Dialog>
  );
}

export const ModalHeader = ({ children }: ModalPartProps) => (
  <DialogHeader>
    <DialogTitle asChild>
      <div>{children}</div>
    </DialogTitle>
  </DialogHeader>
);
export const ModalContent = ({ children }: ModalPartProps) => <div className="flex flex-col gap-3">{children}</div>;
export const ModalFooter = ({ children }: ModalPartProps) => <DialogFooter className="gap-2">{children}</DialogFooter>;

export function AlertModal({ open, title, description, onClose, confirmButtonProps, cancelButtonProps }: AlertModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full" onClick={cancelButtonProps.onClick}>
            {cancelButtonProps.label}
          </AlertDialogCancel>
          <AlertDialogAction className="rounded-full" onClick={confirmButtonProps.onClick}>
            {confirmButtonProps.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AnchoredPopover({ anchor, onClose, placement = "right-start", width = 288, ariaLabel, children }: AnchoredPopoverProps) {
  return (
    <Popover open={anchor !== null} onOpenChange={(o) => !o && onClose()}>
      {anchor && (
        <PopoverAnchor asChild>
          <div className="pointer-events-none fixed" style={{ left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }} />
        </PopoverAnchor>
      )}
      <PopoverContent
        side={placement === "right-start" ? "right" : "bottom"}
        align="start"
        sideOffset={8}
        collisionPadding={8}
        aria-label={ariaLabel}
        role="dialog"
        className="max-h-[calc(100vh-16px)] overflow-y-auto p-0"
        style={{ width }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function Snackbar({ open, onClose, title, description, variant }: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const show = variant === "critical" ? toast.error : variant === "positive" ? toast.success : toast;
    const id = show(title, { description, onAutoClose: onClose, onDismiss: onClose });
    return () => {
      toast.dismiss(id);
    };
  }, [open, title, description, variant, onClose]);
  return null;
}

