"use client";

// EDS DropdownMenu / SelectMenu / Tooltip API, rendered with shadcn DropdownMenu and Tooltip.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckIcon, DropdownDownIcon, DropdownUpIcon } from "@adaptavant/eds-core";
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
import { Button, edsInputBox, TRIGGER_MARKER, useShadField, wrapMarkedTrigger } from "./primitives";

/** EDS popover surface: neutral background, secondary border, 8px corners, shadow-20, no entry animation. */
export const edsPopoverSurface =
  "rounded-[8px] border border-[color:var(--border-secondary)] bg-[color:var(--background-neutral)] p-1 text-[color:var(--text-primary)] [box-shadow:var(--shadow-20)] data-[state=open]:animate-none data-[state=closed]:animate-none";

/** EDS menu row: 12px text (14 below 1024px), 4px corners, grey when highlighted by keyboard or pointer. */
export const edsMenuItem =
  "cursor-pointer items-start gap-3 rounded-[4px] bg-[color:var(--background-neutral)] text-[14px] leading-[22px] text-[color:var(--text-primary)] transition-colors duration-300 lg:gap-2 lg:text-[12px] lg:leading-[20px] focus:bg-[color:var(--background-neutral-secondary)] focus:text-[color:var(--text-primary)] data-[highlighted]:bg-[color:var(--background-neutral-secondary)] hover:data-[highlighted]:bg-[color:var(--background-neutral-hover)] active:data-[highlighted]:bg-[color:var(--background-neutral-pressed)] data-[disabled]:opacity-100 data-[disabled]:text-[color:var(--text-disabled)]";

type MenuCtx = { placement: "bottom" | "bottom-start" | "bottom-end"; offset: number; maxWidth: number; maxHeight: number; matchWidth?: boolean; open?: boolean };
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
    <MenuContext.Provider value={{ placement: popoverPlacement, offset: popoverOffset, maxWidth: popoverMaxWidth, maxHeight: popoverMaxHeight, matchWidth: popoverMatchReferenceWidth, open }}>
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
      // EDS popovers fill their max width unless matched to the trigger.
      style={{ width: m.matchWidth ? "var(--radix-dropdown-menu-trigger-width)" : m.maxWidth, maxWidth: m.maxWidth, maxHeight: m.maxHeight }}
      className={cn("min-w-0 overflow-y-auto", edsPopoverSurface)}
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
      className={cn(edsMenuItem, "px-3 py-3 lg:px-2 lg:py-1.5")}
    >
      {railStart && <span className="inline-flex shrink-0">{railStart}</span>}
      <span className="flex min-w-0 grow flex-col">{children}</span>
      {railEnd && <span className="inline-flex shrink-0">{railEnd}</span>}
    </ShadDropdownMenuItem>
  );
}

export const SelectMenu = (props: SelectMenuProps) => <MenuRoot {...props} />;

/** EDS select trigger: an input-styled box with the value and a grey chevron. */
export function SelectMenuTrigger({ children, placeholder }: SelectMenuTriggerProps) {
  const field = useShadField();
  const { open } = useContext(MenuContext);
  const Chevron = open ? DropdownUpIcon : DropdownDownIcon;
  return (
    <ShadDropdownMenuTrigger asChild>
      <ShadButton
        id={field?.id}
        variant="ghost"
        className={cn(
          "group h-10 w-full justify-between gap-1 px-3 py-0 text-[14px] font-normal leading-[22px] text-[color:var(--text-primary)] lg:h-8 lg:px-2 lg:text-[12px] lg:leading-[20px] hover:bg-[color:var(--background-canvas)] aria-expanded:border-[color:var(--border-input-active)] aria-expanded:shadow-[inset_0_0_0_1px_var(--border-input-active)] hover:text-[color:var(--text-primary)] focus-visible:ring-0 [&_svg]:size-5 lg:[&_svg]:size-4",
          edsInputBox,
          field?.subtle && "w-auto border-transparent"
        )}
      >
        <span className={cn("min-w-0 grow truncate text-start", !children && "text-[color:var(--text-secondary)]")}>{children ?? placeholder}</span>
        <Chevron aria-hidden className="shrink-0 fill-[color:var(--text-secondary)]" />
      </ShadButton>
    </ShadDropdownMenuTrigger>
  );
}

/** Like EDS, an opened select highlights the chosen option (Radix only does that from the keyboard). */
export function SelectMenuPopover({ children }: DropdownMenuPopoverProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { open } = useContext(MenuContext);
  useEffect(() => {
    if (!open) return;
    // After Radix has focused the menu itself.
    const timer = setTimeout(() => ref.current?.closest("[role=menu]")?.querySelector<HTMLElement>("[aria-checked=true]")?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);
  return (
    <DropdownMenuPopover>
      <span ref={ref} hidden />
      {children}
    </DropdownMenuPopover>
  );
}
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
      // shadcn's own tick (first child) is hidden; EDS puts its tick in a leading rail.
      className={cn(edsMenuItem, "px-3 py-2 lg:px-2 lg:py-1.5 [&>span:first-child]:hidden")}
    >
      <span className="-me-1 -ms-1 inline-flex h-[22px] shrink-0 items-center lg:h-5">
        {isSelected ? <CheckIcon aria-hidden className="h-5 w-5 fill-current lg:h-4 lg:w-4" /> : <span className="h-5 w-5 lg:h-4 lg:w-4" />}
      </span>
      {railStart && <span className="inline-flex shrink-0">{railStart}</span>}
      <span className="flex min-w-0 grow flex-col">{children}</span>
      {railEnd && <span className="inline-flex shrink-0">{railEnd}</span>}
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
        <TooltipContent
          side={placement}
          className="w-max max-w-[200px] rounded-[4px] bg-[color:var(--background-inverse)] px-2 py-0.5 text-[12px] leading-[20px] text-[color:var(--text-inverse-secondary)] [box-shadow:var(--shadow-20)] animate-none data-[state=closed]:animate-none"
        >
          {content}
        </TooltipContent>
      </ShadTooltip>
    </TooltipProvider>
  );
}
