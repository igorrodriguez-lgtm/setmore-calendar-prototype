"use client";

// Popovers anchored to a grid rectangle (an appointment block or a clicked slot), composed the
// way the EDS docs describe: Popover + usePopover for placement, useClickAway for dismissal.
import { useEffect, useRef } from "react";
import { Loading, Popover, usePopover } from "@adaptavant/eds-core";
import { useClickAway } from "@adaptavant/eds-core/utils";
import type { AnchoredPopoverProps, PlaceholderProps } from "../kit/types";

export function AnchoredPopover({ anchor, onClose, placement = "right-start", width = 288, ariaLabel, children }: AnchoredPopoverProps) {
  const popover = usePopover({ placement, offset: 8, maxWidth: width, strategy: "fixed" });
  const anchorRef = popover.getReferenceProps().ref;
  const { ref: popRef, style } = popover.getPopoverProps();
  const panel = useRef<HTMLDivElement | null>(null);
  const isOpen = anchor !== null;

  useClickAway({
    refs: [panel],
    onClickAway: (e: Event) => {
      // Clicks inside other floating EDS layers (pickers opened from this popover) aren't "away".
      if ((e.target as Element).closest?.("[data-floating-ui-portal], [role=listbox], [role=menu], [role=dialog]:not([data-anchored])")) return;
      if (isOpen) onClose();
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!anchor) return null;
  return (
    <>
      <div ref={anchorRef} aria-hidden className="pointer-events-none fixed" style={{ left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }} />
      <Popover
        ref={(node: HTMLDivElement | null) => {
          panel.current = node;
          popRef(node);
        }}
        style={{ ...style, width }}
        role="dialog"
        data-anchored
        aria-label={ariaLabel}
        tabIndex={-1}
        shouldUsePortal
        className="z-40"
      >
        {children}
      </Popover>
    </>
  );
}

/** EDS has no Skeleton component, so the EDS kit shows its Loading spinner instead. */
export function Placeholder({ className = "" }: PlaceholderProps) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <Loading size="20" />
    </div>
  );
}
