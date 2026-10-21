"use client";

// Popovers anchored to a grid rectangle (an appointment block or a clicked slot), composed the
// way the EDS docs describe: Popover + usePopover for placement, useClickAway for dismissal.
import { useEffect, useRef, useState } from "react";
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

  // usePopover flips but doesn't shift, so a popover opened low on the screen would run off the
  // bottom. Measure the panel and raise the (invisible) anchor until the panel fits.
  const [panelHeight, setPanelHeight] = useState(0);
  useEffect(() => {
    const el = panel.current;
    if (!isOpen || !el) return;
    const observer = new ResizeObserver(() => setPanelHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  if (!anchor) return null;
  const gap = 8;
  const top = placement === "right-start" && panelHeight ? Math.max(gap, Math.min(anchor.top, window.innerHeight - panelHeight - gap)) : anchor.top;
  return (
    <>
      <div ref={anchorRef} aria-hidden className="pointer-events-none fixed" style={{ left: anchor.left, top, width: anchor.width, height: top === anchor.top ? anchor.height : 1 }} />
      {/* Same layer EDS gives its own popovers (z-10), so pickers opened from inside stack on top. */}
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
        className="z-10"
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
