"use client";

// EDS DropdownMenu / SelectMenu / Tooltip API, rendered with shadcn DropdownMenu and Tooltip.
import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu as ShadDropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem as ShadDropdownMenuItem,
  DropdownMenuTrigger as ShadDropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../shadcn/tooltip";
import { Button as ShadButton } from "../../shadcn/button";
import type {
  DropdownMenuItemProps,
  DropdownMenuPopoverProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  SelectMenuItemProps,
  SelectMenuProps,
  SelectMenuTriggerProps,
  TooltipProps,
} from "../types";
import { Button, TRIGGER_MARKER, useShadField, wrapMarkedTrigger } from "./primitives";

type MenuCtx = { placement: "bottom" | "bottom-start" | "bottom-end"; offset: number; maxWidth: number; maxHeight: number; matchWidth?: boolean };
const MenuContext = createContext<MenuCtx>({ placement: "bottom-start", offset: 4, maxWidth: 400, maxHeight: 356 });

function MenuRoot({ children, isDisabled, popoverPlacement = "bottom-start", popoverOffset = 4, popoverMaxWidth = 400, popoverMaxHeight = 356, popoverMatchReferenceWidth }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const content =
    typeof children === "function"
      ? wrapMarkedTrigger(children({ triggerProps: { [TRIGGER_MARKER]: true }, isMenuOpen: open }), (el) => (
          <ShadDropdownMenuTrigger asChild disabled={isDisabled}>
            {el}
          </ShadDropdownMenuTrigger>
        ))
      : children;
  return (
    <MenuContext.Provider value={{ placement: popoverPlacement, offset: popoverOffset, maxWidth: popoverMaxWidth, maxHeight: popoverMaxHeight, matchWidth: popoverMatchReferenceWidth }}>
      <ShadDropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        {content}
      </ShadDropdownMenu>
    </MenuContext.Provider>
  );
}

export const DropdownMenu = MenuRoot;

export function DropdownMenuTrigger({ variant = "neutralSecondary", ...rest }: DropdownMenuTriggerProps) {
  return (
    <ShadDropdownMenuTrigger asChild>
      <Button variant={variant} {...rest} />
    </ShadDropdownMenuTrigger>
  );
}

export function DropdownMenuPopover({ children }: DropdownMenuPopoverProps) {
  const m = useContext(MenuContext);
  return (
    <DropdownMenuContent
      align={m.placement === "bottom-end" ? "end" : m.placement === "bottom" ? "center" : "start"}
      sideOffset={m.offset}
      style={{ maxWidth: m.maxWidth, maxHeight: m.maxHeight, minWidth: m.matchWidth ? "var(--radix-dropdown-menu-trigger-width)" : 160 }}
      className="overflow-y-auto"
    >
      {children}
    </DropdownMenuContent>
  );
}

export const DropdownMenuList = ({ children }: { children: ReactNode }) => <>{children}</>;

export function DropdownMenuItem({ children, onClick, isDisabled, railStart, railEnd, id }: DropdownMenuItemProps) {
  return (
    <ShadDropdownMenuItem
      id={id}
      disabled={isDisabled}
      onSelect={(e) => {
        if (onClick?.() === false) e.preventDefault();
      }}
      className="text-xs"
    >
      {railStart}
      <span className="min-w-0 flex-1">{children}</span>
      {railEnd}
    </ShadDropdownMenuItem>
  );
}

export const SelectMenu = (props: SelectMenuProps) => <MenuRoot {...props} />;

export function SelectMenuTrigger({ children, placeholder }: SelectMenuTriggerProps) {
  const field = useShadField();
  return (
    <ShadDropdownMenuTrigger asChild>
      <ShadButton id={field?.id} variant={field?.subtle ? "ghost" : "outline"} className={cn("h-7 justify-between gap-1 px-2 text-xs font-normal", !field?.subtle && "h-8 w-full")}>
        <span className={cn("truncate", !children && "text-muted-foreground")}>{children ?? placeholder}</span>
        <ChevronDown className="opacity-50" />
      </ShadButton>
    </ShadDropdownMenuTrigger>
  );
}

export const SelectMenuPopover = DropdownMenuPopover;
export const SelectMenuListbox = ({ children }: { children: ReactNode }) => <>{children}</>;

export function SelectMenuItem({ children, isSelected, onClick, isDisabled, railStart, railEnd, id }: SelectMenuItemProps) {
  return (
    <DropdownMenuCheckboxItem
      id={id}
      checked={isSelected}
      disabled={isDisabled}
      onSelect={(e) => {
        if (onClick?.() === false) e.preventDefault();
      }}
      className="text-xs"
    >
      {railStart}
      <span className="min-w-0 flex-1">{children}</span>
      {railEnd}
    </DropdownMenuCheckboxItem>
  );
}

export function Tooltip({ content, placement = "bottom", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={300}>
      <ShadTooltip open={open} onOpenChange={setOpen}>
        {wrapMarkedTrigger(children({ triggerProps: { [TRIGGER_MARKER]: true }, close: () => setOpen(false) }), (el) => (
          <TooltipTrigger asChild>{el}</TooltipTrigger>
        ))}
        <TooltipContent side={placement}>{content}</TooltipContent>
      </ShadTooltip>
    </TooltipProvider>
  );
}
