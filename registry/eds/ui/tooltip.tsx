"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// EDS Tooltip API (content string, placement, delay) with Radix Tooltip behaviour.
export type TooltipProps = {
  /** Plain text only, as in EDS. */
  content: string;
  placement?: "top" | "right" | "bottom" | "left";
  /** Milliseconds before it appears. */
  delay?: number;
  maxWidth?: number;
  /** The trigger: a single focusable element (Button, IconButton, link…). */
  children: React.ReactElement;
};

function Tooltip({ content, placement = "top", delay = 300, maxWidth = 200, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={6}
            style={{ maxWidth }}
            className={cn(
              "z-50 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
