"use client";

// "Test" kit: Thani's Earth shadcn registry (components/test-ui, Base UI) behind the same
// EDS-shaped API as the other kits. Anything the registry doesn't have falls back to the stock
// shadcn kit, which picks up the Test theme because tailwind.test.config.ts also compiles it.
import {
  Children,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button as RegistryButton } from "../../test-ui/button";
import { Checkbox as RegistryCheckbox } from "../../test-ui/checkbox";
import { Field as RegistryField, FieldDescription, FieldError, FieldLabel } from "../../test-ui/field";
import { Input } from "../../test-ui/input";
import { Textarea as RegistryTextarea } from "../../test-ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../test-ui/select";
import { shadcnKit } from "../shadcn";
import type {
  ButtonProps,
  CheckboxProps,
  FieldProps,
  IconButtonProps,
  Kit,
  SearchInputProps,
  SelectMenuItemProps,
  SelectMenuProps,
  SelectMenuTriggerProps,
  TextareaProps,
  TextInputProps,
  TimePickerProps,
} from "../types";

type RegistryVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
const variantMap: Record<NonNullable<ButtonProps["variant"]>, RegistryVariant> = {
  accentPrimary: "default",
  accentSecondary: "secondary",
  neutralPrimary: "default",
  neutralSecondary: "outline",
  neutralSecondaryIntense: "outline",
  neutralTertiary: "ghost",
  criticalPrimary: "destructive",
  criticalSecondary: "destructive",
  criticalTertiary: "ghost",
  inversePrimary: "outline",
};
const sizeMap = { small: "sm", standard: "default", large: "lg", xLarge: "lg" } as const;
const iconSizeMap = { small: "icon-sm", standard: "icon", large: "icon-lg", xLarge: "icon-lg" } as const;

function Button({ variant = "accentPrimary", size = "standard", iconStart: IconStart, iconEnd: IconEnd, isDisabled, isLoading, isPressed, loadingLabel, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <RegistryButton
      type={type}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn("relative", variant === "criticalTertiary" && "text-destructive", className)}
      {...rest}
    >
      <span className={cn("inline-flex items-center gap-1.5", isLoading && "invisible")}>
        {IconStart && <IconStart />}
        {children}
        {IconEnd && <IconEnd />}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label={loadingLabel ?? "Loading"}>
          <Loader2 className="animate-spin" />
        </span>
      )}
    </RegistryButton>
  );
}

function IconButton({ icon: Icon, variant = "neutralTertiary", size = "standard", isDisabled, isLoading, isPressed, className, type = "button", loadingLabel, ...rest }: IconButtonProps) {
  return (
    <RegistryButton
      type={type}
      variant={variantMap[variant]}
      size={iconSizeMap[size]}
      title={rest["aria-label"]}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={className}
      {...rest}
    >
      {isLoading ? <Loader2 className="animate-spin" aria-label={loadingLabel ?? "Loading"} /> : <Icon />}
    </RegistryButton>
  );
}

/** EDS inputs report DOM change events; Base UI reports booleans. */
function fakeChange(checked: boolean) {
  return { target: { checked }, currentTarget: { checked } } as unknown as ChangeEvent<HTMLInputElement>;
}

function Checkbox({ label, checked, onChange, isDisabled, description, className }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <RegistryCheckbox id={id} checked={checked} disabled={isDisabled} onCheckedChange={(c) => onChange?.(fakeChange(c))} />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-sm">
        {label}
        {description && <span className="block text-muted-foreground">{description}</span>}
      </label>
    </div>
  );
}

const FieldContext = createContext<{ id: string; subtle: boolean } | null>(null);

function FieldShell({ subtle, label, labelVisibility = "visible", description, status, fieldMessage, children, className }: FieldProps & { subtle: boolean }) {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id, subtle }}>
      <RegistryField orientation={subtle ? "horizontal" : "vertical"} data-invalid={status === "error" || undefined} className={cn("min-w-0 gap-1.5", subtle && "w-auto", className)}>
        <FieldLabel htmlFor={id} className={labelVisibility === "hidden" ? "sr-only" : undefined}>
          {label}
        </FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        {children}
        {fieldMessage && <FieldError>{fieldMessage}</FieldError>}
      </RegistryField>
    </FieldContext.Provider>
  );
}

const Field = (props: FieldProps) => <FieldShell {...props} subtle={false} />;
const InlineField = (props: FieldProps) => <FieldShell {...props} subtle />;

function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart, adornmentEnd, onKeyDown, onFocus, onBlur }: TextInputProps) {
  const field = useContext(FieldContext);
  return (
    <div className="relative flex w-full items-center">
      {adornmentStart && <span className="pointer-events-none absolute left-2.5 flex items-center text-muted-foreground">{adornmentStart}</span>}
      <Input
        id={field?.id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(adornmentStart && "pl-8", adornmentEnd && "pr-8", field?.subtle && "border-transparent hover:border-input")}
      />
      {adornmentEnd && <span className="absolute right-2 flex items-center">{adornmentEnd}</span>}
    </div>
  );
}

function SearchInput({ onClear, value, ...props }: SearchInputProps) {
  return (
    <TextInput
      {...props}
      value={value}
      type="search"
      adornmentStart={<Search className="size-3.5" />}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClear) onClear();
      }}
      adornmentEnd={
        onClear && value ? (
          <button type="button" aria-label="Clear search" onClick={onClear} className="rounded-sm opacity-70 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        ) : null
      }
    />
  );
}

function Textarea({ value, onChange, placeholder, row = 3 }: TextareaProps) {
  const field = useContext(FieldContext);
  return (
    <RegistryTextarea
      id={field?.id}
      rows={row}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("min-h-0", field?.subtle && "border-transparent hover:border-input")}
    />
  );
}

/**
 * EDS SelectMenu is item-driven (each item has its own onClick and isSelected); the registry
 * Select is value-driven. Items register their onClick under a value, and the Select calls it.
 */
type SelectMenuCtx = { handlers: React.RefObject<Map<string, () => boolean | void>>; setSelected: (v: string) => void };
const SelectMenuContext = createContext<SelectMenuCtx | null>(null);

function itemValue(id: string | undefined, children: ReactNode) {
  if (id) return id;
  return Children.toArray(children).filter((c) => typeof c === "string" || typeof c === "number").join("");
}

function SelectMenu({ children }: SelectMenuProps) {
  const handlers = useRef(new Map<string, () => boolean | void>());
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SelectMenuContext.Provider value={{ handlers, setSelected }}>
      <Select value={selected} onValueChange={(v) => v != null && handlers.current.get(String(v))?.()}>
        {typeof children === "function" ? children({ triggerProps: {}, isMenuOpen: false }) : children}
      </Select>
    </SelectMenuContext.Provider>
  );
}

function SelectMenuTrigger({ children, placeholder }: SelectMenuTriggerProps) {
  const field = useContext(FieldContext);
  return (
    <SelectTrigger id={field?.id} size="sm" className={cn(field?.subtle ? "border-transparent hover:border-input" : "w-full")}>
      <span className={cn("truncate", !children && "text-muted-foreground")}>{children ?? placeholder}</span>
    </SelectTrigger>
  );
}

function SelectMenuPopover({ children }: { children: ReactNode }) {
  return <SelectContent alignItemWithTrigger={false}>{children}</SelectContent>;
}

const SelectMenuListbox = ({ children }: { children: ReactNode }) => <>{children}</>;

function SelectMenuItem({ children, isSelected, onClick, isDisabled, id }: SelectMenuItemProps) {
  const ctx = useContext(SelectMenuContext)!;
  const fallback = useId();
  const value = itemValue(id, children) || fallback;
  ctx.handlers.current.set(value, () => onClick?.());
  useLayoutEffect(() => {
    if (isSelected) ctx.setSelected(value);
  }, [isSelected, value, ctx]);
  return (
    <SelectItem value={value} disabled={isDisabled}>
      {children}
    </SelectItem>
  );
}

function timeLabel(d: Date, format: "12" | "24") {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  if (format === "24") return `${String(h).padStart(2, "0")}:${m}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

/** EDS-only TimePicker, built here on the registry Select. */
function TimePicker({ label, format = "12", interval = 60, variant = "standard", defaultValue, minValue, maxValue, onSelect }: TimePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(defaultValue);
  const base = defaultValue ?? new Date();
  const options: Date[] = [];
  for (let m = 0; m < 24 * 60; m += interval) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), Math.floor(m / 60), m % 60);
    const mins = d.getHours() * 60 + d.getMinutes();
    if (minValue && mins < minValue.getHours() * 60 + minValue.getMinutes()) continue;
    if (maxValue && mins > maxValue.getHours() * 60 + maxValue.getMinutes()) continue;
    options.push(d);
  }
  // Keep the current value selectable even when it falls outside min/max (e.g. a slot earlier than now).
  if (selected && !options.some((o) => o.getTime() === selected.getTime())) {
    options.push(selected);
    options.sort((a, b) => a.getTime() - b.getTime());
  }
  const items = options.map((d) => ({ value: String(d.getTime()), label: timeLabel(d, format) }));
  return (
    <Select
      items={items}
      value={selected ? String(selected.getTime()) : null}
      onValueChange={(v) => {
        const d = options.find((o) => String(o.getTime()) === v);
        if (!d) return;
        setSelected(d);
        onSelect({ newOption: { time: timeLabel(d, format), dateObject: d }, inputState: "VALID" });
      }}
    >
      <SelectTrigger size="sm" aria-label={typeof label === "string" ? label : "Time"} className={cn(variant === "subtle" && "border-transparent hover:border-input [&>svg]:hidden")}>
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const testKit: Kit = {
  // Fallbacks: stock shadcn (Dialog, Popover, DropdownMenu, Tooltip, Tabs, Switch, Calendar,
  // Avatar, Command, Sonner, Skeleton) styled by the Test theme.
  ...shadcnKit,
  name: "test",
  label: "Test",
  // From Thani's registry.
  Button,
  IconButton,
  Checkbox,
  Field,
  InlineField,
  TextInput,
  SearchInput,
  Textarea,
  SelectMenu,
  SelectMenuTrigger,
  SelectMenuPopover,
  SelectMenuListbox,
  SelectMenuItem,
  TimePicker,
};
