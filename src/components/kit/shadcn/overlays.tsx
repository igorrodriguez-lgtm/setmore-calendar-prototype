"use client";

// EDS Modal / AlertModal / Snackbar API and the anchored popover, rendered with shadcn
// Dialog, AlertDialog, Sonner and Popover.
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { RemoveIcon } from "@adaptavant/eds-core";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "../../shadcn/dialog";
import { Button, IconButton } from "./primitives";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertDialog, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle } from "../../shadcn/alert-dialog";
import { Popover, PopoverAnchor, PopoverContent } from "../../shadcn/popover";
import type { AlertModalProps, AnchoredPopoverProps, ModalPartProps, ModalProps, SnackbarProps } from "../types";
import { cn } from "@/lib/utils";
import { edsPopoverSurface } from "./menus";

/**
 * EDS Modal anatomy on Radix Dialog: the shadcn overlay recoloured to EDS's modal overlay, a centred
 * 8px-corner panel with shadow-30, EDS's close button top-right, and 24px side padding per part.
 */
export function Modal({ open, onClose, ariaLabel, size = 640, closeButtonProps, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogPortal>
        <DialogOverlay className="z-10 bg-[color:var(--background-modal-overlay)] data-[state=closed]:animate-none data-[state=open]:animate-none" />
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center p-4">
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="pointer-events-auto relative flex max-h-full max-w-full flex-col gap-4 rounded-[8px] bg-[color:var(--background-canvas)] pb-6 pt-5 text-[color:var(--text-primary)] outline-none [box-shadow:var(--shadow-30)]"
            style={{ width: size }}
          >
            {ariaLabel && <DialogTitle className="sr-only">{ariaLabel}</DialogTitle>}
            {closeButtonProps && (
              <IconButton aria-label={closeButtonProps.label} icon={RemoveIcon} variant="neutralTertiary" size="standard" onClick={closeButtonProps.onClick} className="absolute end-3 top-3 z-10" />
            )}
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </Dialog>
  );
}

export const ModalHeader = ({ children, className }: ModalPartProps) => (
  <DialogTitle asChild>
    <header className={cn("relative flex shrink-0 flex-col gap-2 px-6 pe-12", className)}>{children}</header>
  </DialogTitle>
);
export const ModalContent = ({ children, className }: ModalPartProps) => <section className={cn("overflow-auto px-6", className)}>{children}</section>;
export const ModalFooter = ({ children, className }: ModalPartProps) => <footer className={cn("flex items-center justify-end gap-2 px-6 pt-2", className)}>{children}</footer>;

/** EDS AlertModal anatomy on Radix AlertDialog: 480px panel, heading, secondary text, Cancel + confirm. */
export function AlertModal({ open, title, description, onClose, confirmButtonProps, cancelButtonProps }: AlertModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-10 bg-[color:var(--background-modal-overlay)] data-[state=closed]:animate-none data-[state=open]:animate-none" />
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center p-4">
          <AlertDialogPrimitive.Content
            className="pointer-events-auto relative flex max-h-full w-[480px] max-w-full flex-col gap-2 rounded-[8px] bg-[color:var(--background-canvas)] pb-6 pt-5 text-[color:var(--text-primary)] outline-none [box-shadow:var(--shadow-30)]"
            onOpenAutoFocus={(e) => {
              // EDS focuses the dialog itself, not its first button.
              e.preventDefault();
              (e.currentTarget as HTMLElement).focus();
            }}
            tabIndex={0}
          >
            <header className="relative flex shrink-0 flex-col gap-2 px-6 pe-12">
              <AlertDialogTitle className="text-[16px] font-semibold leading-[24px]">{title}</AlertDialogTitle>
            </header>
            <section className="overflow-auto px-6">
              <AlertDialogDescription className="text-[14px] leading-[22px] text-[color:var(--text-secondary)] lg:text-[12px] lg:leading-[20px]">{description}</AlertDialogDescription>
            </section>
            <footer className="flex flex-col-reverse items-center justify-stretch gap-2 px-6 pt-4 md:flex-row md:justify-end">
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="neutralTertiary" onClick={cancelButtonProps.onClick}>
                  {cancelButtonProps.label}
                </Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button variant="accentPrimary" onClick={confirmButtonProps.onClick}>
                  {confirmButtonProps.label}
                </Button>
              </AlertDialogPrimitive.Action>
            </footer>
          </AlertDialogPrimitive.Content>
        </div>
      </AlertDialogPortal>
    </AlertDialog>
  );
}

export function AnchoredPopover({ anchor, onClose, placement = "right-start", width = 288, ariaLabel, children }: AnchoredPopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const isOpen = anchor !== null;
  // Same as the EDS kit: once open, focus moves to the panel itself (even past an autofocused field).
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);
  return (
    <Popover open={anchor !== null} onOpenChange={(o) => !o && onClose()}>
      {anchor && (
        <PopoverAnchor asChild>
          <div className="pointer-events-none fixed" style={{ left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }} />
        </PopoverAnchor>
      )}
      <PopoverContent
        ref={panel}
        side={placement === "right-start" ? "right" : "bottom"}
        align="start"
        sideOffset={8}
        collisionPadding={8}
        aria-label={ariaLabel}
        role="dialog"
        tabIndex={-1}
        // Like EDS, focus lands on the panel itself, not on its first button.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus({ preventScroll: true });
        }}
        onInteractOutside={(e) => {
          if ((e.target as Element | null)?.closest?.("[role=menu], [role=listbox], [role=dialog], [role=alertdialog], [data-radix-popper-content-wrapper]")) e.preventDefault();
        }}
        onFocusOutside={(e) => e.preventDefault()}
        className={cn("z-10 max-h-[calc(100vh-16px)] overflow-y-auto outline-none", edsPopoverSurface)}
        style={{ width }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

/** Sonner places and times the toast; the card itself is EDS's snackbar (dark, 360px, close on hover). */
export function Snackbar({ open, onClose, title, description }: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const id = toast.custom(
      (t) => (
        <div
          role="alert"
          className="group relative flex min-h-[44px] w-full items-center gap-2 rounded-[8px] bg-[color:var(--background-inverse-secondary)] px-4 py-2 [box-shadow:var(--shadow-40)] md:w-[360px]"
        >
          <div className="flex flex-1 flex-col items-start">
            <span className="line-clamp-2 text-[14px] font-medium leading-[22px] text-[color:var(--text-inverse)] lg:text-[12px] lg:leading-[20px]">{title}</span>
            {description && <span className="text-[14px] leading-[22px] text-[color:var(--text-inverse-secondary)] lg:text-[12px] lg:leading-[20px]">{description}</span>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => toast.dismiss(t)}
            className="absolute -start-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--background-inverse-tertiary)] text-[color:var(--text-inverse)] opacity-0 hover:bg-[color:var(--background-inverse-tertiary-hover)] focus-visible:opacity-100 group-hover:opacity-100"
          >
            <RemoveIcon aria-hidden className="h-3 w-3 fill-current" />
          </button>
        </div>
      ),
      { duration: 3000, onAutoClose: onClose, onDismiss: onClose, unstyled: true }
    );
    return () => {
      toast.dismiss(id);
    };
  }, [open, title, description, onClose]);
  return null;
}
