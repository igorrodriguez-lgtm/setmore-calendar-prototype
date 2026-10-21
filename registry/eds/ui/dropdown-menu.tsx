"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// EDS DropdownMenu parts and props (popoverPlacement, railStart/railEnd, onClick returning
// false keeps the menu open) with Radix behaviour. Unlike EDS, it can also be controlled
// with isOpen / onOpenChange.

const PLACEMENT = { bottom: "center", "bottom-start": "start", "bottom-end": "end" } as const;
const MenuContext = React.createContext<{ placement: keyof typeof PLACEMENT; maxWidth: number }>({ placement: "bottom-start", maxWidth: 400 });

export type DropdownMenuProps = {
  children: React.ReactNode;
  popoverPlacement?: keyof typeof PLACEMENT;
  popoverMaxWidth?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function DropdownMenu({ children, popoverPlacement = "bottom-start", popoverMaxWidth = 400, isOpen, onOpenChange }: DropdownMenuProps) {
  return (
    <MenuContext.Provider value={{ placement: popoverPlacement, maxWidth: popoverMaxWidth }}>
      <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
        {children}
      </DropdownMenuPrimitive.Root>
    </MenuContext.Provider>
  );
}

/** Wraps your own trigger element (e.g. <IconButton>) so it opens the menu. */
function DropdownMenuTrigger({ children }: { children: React.ReactElement }) {
  return <DropdownMenuPrimitive.Trigger asChild>{children}</DropdownMenuPrimitive.Trigger>;
}

function DropdownMenuPopover({ children, className }: { children: React.ReactNode; className?: string }) {
  const { placement, maxWidth } = React.useContext(MenuContext);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={PLACEMENT[placement]}
        sideOffset={4}
        style={{ maxWidth }}
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export type DropdownMenuItemProps = {
  children: React.ReactNode;
  /** Return false to keep the menu open. */
  onClick?: () => boolean | void;
  isDisabled?: boolean;
  /** Shows a tick and marks the item as checked. */
  isSelected?: boolean;
  railStart?: React.ReactNode;
  railEnd?: React.ReactNode;
};

function DropdownMenuItem({ children, onClick, isDisabled, isSelected, railStart, railEnd }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={isDisabled}
      aria-checked={isSelected}
      onSelect={(e) => {
        if (onClick?.() === false) e.preventDefault();
      }}
      className="relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0"
    >
      {isSelected !== undefined && <span className="flex w-4 justify-center">{isSelected && <Check />}</span>}
      {railStart}
      <span className="min-w-0 flex-1">{children}</span>
      {railEnd && <span className="text-xs text-muted-foreground">{railEnd}</span>}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuSeparator() {
  return <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuPopover, DropdownMenuItem, DropdownMenuSeparator };
