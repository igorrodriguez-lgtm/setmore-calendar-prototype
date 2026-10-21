"use client";

// shadcn kit: shadcn/ui components themed with EDS colours (see globals.css), adapted to the
// same EDS-shaped props as the EDS kit so screens can switch between them.
import { useState, type ReactElement } from "react";
import { Calendar as CalendarIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { Textarea } from "../shadcn/textarea";
import { Label } from "../shadcn/label";
import { Checkbox as ShadCheckbox } from "../shadcn/checkbox";
import { Avatar as ShadAvatar, AvatarFallback } from "../shadcn/avatar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { Calendar } from "../shadcn/calendar";
import { MONTHS, fromKey, toKey } from "../calendar/dates";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../shadcn/dialog";
import { avatarTint, initials } from "../eds";
import type {
  AnchoredPopoverProps,
  AvatarProps,
  ButtonProps,
  CheckboxProps,
  DatePickerProps,
  DropdownItemProps,
  DropdownProps,
  FieldProps,
  IconButtonProps,
  Kit,
  ModalProps,
  SelectProps,
  TextAreaProps,
  TextInputProps,
} from "./types";

const variantMap: Record<NonNullable<ButtonProps["variant"]>, { variant: ShadButtonProps["variant"]; className?: string }> = {
  accentPrimary: { variant: "default" },
  accentSecondary: { variant: "secondary" },
  criticalPrimary: { variant: "destructive" },
  criticalSecondary: { variant: "outline", className: "border-destructive text-destructive hover:text-destructive" },
  criticalTertiary: { variant: "ghost", className: "text-destructive hover:text-destructive" },
  inversePrimary: { variant: "outline", className: "border-transparent" },
  neutralPrimary: { variant: "default", className: "bg-foreground hover:bg-foreground/90" },
  neutralSecondary: { variant: "outline" },
  neutralSecondaryIntense: { variant: "outline", className: "border-foreground/50" },
  neutralTertiary: { variant: "ghost" },
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, { size: ShadButtonProps["size"]; className?: string; icon: string }> = {
  small: { size: "sm", icon: "h-8 w-8" },
  standard: { size: "default", className: "h-10 text-[15px]", icon: "h-10 w-10" },
  large: { size: "lg", className: "h-12 px-5 text-base", icon: "h-12 w-12" },
  xLarge: { size: "lg", className: "h-14 px-6 text-lg", icon: "h-14 w-14" },
};

function Button({
  variant = "accentPrimary",
  size = "standard",
  iconStart: IconStart,
  iconEnd: IconEnd,
  isDisabled,
  isLoading,
  isPressed,
  loadingLabel,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const v = variantMap[variant];
  const s = sizeMap[size];
  return (
    <ShadButton
      type={type}
      variant={v.variant}
      size={s.size}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn("relative", v.className, s.className, isPressed && "bg-accent")}
      {...rest}
    >
      <span className={cn("inline-flex items-center gap-2", isLoading && "invisible")}>
        {IconStart && <IconStart />}
        {children}
        {IconEnd && <IconEnd />}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label={loadingLabel ?? "Loading"}>
          <Loader2 className="animate-spin" />
        </span>
      )}
    </ShadButton>
  );
}

function IconButton({ icon: Icon, label, variant = "neutralTertiary", size = "standard", isDisabled, onClick, ...rest }: IconButtonProps) {
  const v = variantMap[variant];
  return (
    <ShadButton
      type="button"
      variant={v.variant}
      size="icon"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(v.className, sizeMap[size].icon, "[&_svg]:size-5")}
      {...rest}
    >
      <Icon />
    </ShadButton>
  );
}

function Field({ label, description, children }: FieldProps) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      {children}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart: Adornment }: TextInputProps) {
  return (
    <div className="relative">
      {Adornment && <Adornment className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-10", Adornment && "pl-9")}
      />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return <Textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <ShadSelect value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  );
}

function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const date = fromKey(value);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ShadButton variant="outline" className="h-10 w-full justify-between rounded-md px-3 font-normal">
          {MONTHS[date.getMonth()].slice(0, 3)} {date.getDate()}, {date.getFullYear()}
          <CalendarIcon className="opacity-50" />
        </ShadButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(picked) => {
            if (picked) onChange(toKey(picked));
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function Checkbox({ isChecked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-3 text-sm">
      <ShadCheckbox className="h-[18px] w-[18px] rounded-[4px]" checked={isChecked} onCheckedChange={(c) => onChange(c === true)} />
      {label}
    </label>
  );
}

function Avatar({ name, size = "standard" }: AvatarProps) {
  return (
    <ShadAvatar className={size === "small" ? "h-7 w-7" : "h-9 w-9"}>
      <AvatarFallback className={cn("font-semibold", avatarTint(name), size === "small" ? "text-[11px]" : "text-sm")}>
        {initials(name)}
      </AvatarFallback>
    </ShadAvatar>
  );
}

function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
        {footer && <DialogFooter className="gap-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

function Dropdown({ trigger, children, align = "start", width = 280 }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger as ReactElement}</PopoverTrigger>
      <PopoverContent align={align} className="p-1" style={{ width }}>
        {children(() => setIsOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

function DropdownItem({ onSelect, icon: Icon, isSelected, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="flex-1">{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </button>
  );
}

function AnchoredPopover({ anchor, onClose, children }: AnchoredPopoverProps) {
  return (
    <Popover open={anchor !== null} onOpenChange={(open) => !open && onClose()}>
      {anchor && (
        <PopoverAnchor asChild>
          <div
            className="pointer-events-none fixed"
            style={{ left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }}
          />
        </PopoverAnchor>
      )}
      <PopoverContent side="right" align="start" sideOffset={8} className="w-80">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export const shadcnKit: Kit = {
  name: "shadcn",
  label: "shadcn",
  Button,
  IconButton,
  Field,
  TextInput,
  TextArea,
  Select,
  DatePicker,
  Checkbox,
  Avatar,
  Modal,
  Dropdown,
  DropdownItem,
  AnchoredPopover,
};
