"use client";

import { useEffect } from "react";
import { SnackbarContent } from "@adaptavant/eds-core";
import type { SnackbarProps } from "../kit/types";

// EDS Snackbar (eds-core 1.48.0) sets its position with kebab-case style keys such as
// 'inset-inline-start', which React warns about. This keeps the same EDS card (SnackbarContent)
// and does the positioning and auto-close here instead.
const corner = {
  "top-start": "top-4 left-4",
  "top-end": "top-4 right-4",
  "bottom-start": "bottom-4 left-4",
  "bottom-end": "bottom-4 right-4",
};

export function Snackbar({ open, onClose, title, description, variant, placement }: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [open, title, onClose]);

  if (!open) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed z-50 ${corner[placement]}`}>
      <SnackbarContent title={title} description={description} variant={variant} closeButtonProps={{ label: "Close", onClick: onClose }} />
    </div>
  );
}
