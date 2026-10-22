"use client";

// "Test" kit: Thani's Earth shadcn registry (components/test-ui, Base UI) behind the same
// EDS-shaped API as the other kits, dressed with the same EDS recipe as the shadcn kit so all
// three render identically. Anything the registry doesn't have falls back to the shadcn kit.
import { Children, createContext, useContext, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { CheckboxCheckIcon, CheckIcon, DropdownDownIcon, DropdownUpIcon, ErrorIcon, RemoveIcon, SearchIcon } from "@adaptavant/eds-core";
import { cn } from "@/lib/utils";
import { Button as RegistryButton } from "../../test-ui/button";
import { Checkbox as RegistryCheckbox } from "../../test-ui/checkbox";
import { Field as RegistryField, FieldDescription, FieldError, FieldLabel } from "../../test-ui/field";
import { Input } from "../../test-ui/input";
import { Textarea as RegistryTextarea } from "../../test-ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../test-ui/select";
import { shadcnKit } from "../shadcn";
import { controlLine, controlText, edsButtonClass, edsInputBox, edsInputText, edsSubtle } from "../shadcn/primitives";
import { edsMenuItem, edsPopoverSurface } from "../shadcn/menus";
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
} from "../types";

/** Undo the registry button's own extras that EDS doesn't have (padding-box fill, 1px press nudge). */
const registryButtonReset = "bg-clip-border active:[&:not([aria-haspopup])]:translate-y-0";
/** The registry sizes unsized icons with a :not() selector, which outranks the recipe's icon size. */
const registryIconSize = {
  small: "[&_svg:not([class*='size-'])]:size-4",
  standard: "[&_svg:not([class*='size-'])]:size-4",
  large: "[&_svg:not([class*='size-'])]:size-5",
  xLarge: "[&_svg:not([class*='size-'])]:size-5",
} as const;

function Button({ variant = "accentPrimary", size = "standard", iconStart: IconStart, iconEnd: IconEnd, isDisabled, isLoading, isPressed, loadingLabel, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <RegistryButton
      type={type}
      variant="ghost"
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn(edsButtonClass(variant, size, false), registryButtonReset, registryIconSize[size], className)}
      {...rest}
    >
      <span className={cn("inline-flex min-w-0 items-center gap-1", isLoading && "invisible")}>
        {IconStart && (
          <span className="-ms-1 inline-flex shrink-0">
            <IconStart />
          </span>
        )}
        <span className="min-w-0 truncate font-medium">{children}</span>
        {IconEnd && (
          <span className="-me-1 inline-flex shrink-0">
            <IconEnd />
          </span>
        )}
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
      variant="ghost"
      size="icon"
      title={rest["aria-label"]}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn(edsButtonClass(variant, size, true), registryButtonReset, registryIconSize[size], "shrink-0", className)}
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
    <div className={cn("flex min-w-0 flex-col items-start", className)}>
      <label htmlFor={id} className={cn("group flex min-w-0 items-start gap-3 lg:gap-2", controlText, isDisabled ? "text-[color:var(--text-disabled)]" : "cursor-pointer text-[color:var(--text-primary)]")}>
        <span className={cn(controlLine, "relative")}>
          {/* The registry's tick (its indicator) is hidden; EDS's tick is drawn on top. */}
          <RegistryCheckbox
            id={id}
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={(c) => onChange?.(fakeChange(c))}
            className="h-5 w-5 rounded-[4px] border-[color:var(--border-input)] bg-[color:var(--background-canvas)] transition-colors duration-300 after:hidden hover:border-[color:var(--border-input-hover)] group-hover:border-[color:var(--border-input-hover)] focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-1 lg:h-4 lg:w-4 data-[checked]:border-[color:var(--border-input-active)] data-[checked]:bg-[color:var(--background-inverse)] data-[disabled]:border-[color:var(--border-input-disabled)] data-[disabled]:bg-[color:var(--background-neutral-disabled)] data-[disabled]:opacity-100 [&>span]:hidden"
          />
          {checked && (
            <span className="pointer-events-none absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 p-px lg:h-4 lg:w-4">
              <CheckboxCheckIcon aria-hidden className={cn("h-full w-full fill-current", isDisabled ? "text-[color:var(--text-disabled)]" : "text-[color:var(--text-inverse)]")} />
            </span>
          )}
        </span>
        <span className="flex min-w-0 grow flex-col">
          {label}
          {description && <span className="text-[color:var(--text-secondary)]">{description}</span>}
        </span>
      </label>
    </div>
  );
}

type FieldCtx = { id: string; subtle: boolean; invalid: boolean; describedBy?: string };
const FieldContext = createContext<FieldCtx | null>(null);

/** Registry Field parts laid out as EDS's Field (stacked) and InlineField (label column + control column). */
function FieldShell({ subtle, label, labelVisibility = "visible", secondaryLabel, description, status, fieldMessage, children, className }: FieldProps & { subtle: boolean }) {
  const id = useId();
  const invalid = status === "error";
  const describedBy = [description && `${id}--description`, fieldMessage && `${id}--message`].filter(Boolean).join(" ") || undefined;
  const tone = invalid ? "text-[color:var(--text-critical)]" : "text-[color:var(--text-caution)]";
  const labelEl = (
    <FieldLabel htmlFor={id} className={cn("w-auto gap-1 font-normal text-[color:var(--text-primary)]", controlText, labelVisibility === "hidden" && "sr-only")}>
      {label}
      {secondaryLabel && <span className="break-normal text-[color:var(--text-secondary)]">{secondaryLabel}</span>}
    </FieldLabel>
  );
  return (
    <FieldContext.Provider value={{ id, subtle, invalid, describedBy }}>
      <RegistryField orientation="vertical" className={cn("min-w-0 items-stretch gap-1", subtle && "w-auto flex-row gap-0.5 *:w-auto", className)}>
        {subtle ? <div className="flex">{labelEl}</div> : labelEl}
        {description && (
          <FieldDescription id={`${id}--description`} className={cn("-mt-1 text-[color:var(--text-secondary)]", controlText)}>
            {description}
          </FieldDescription>
        )}
        {subtle ? <div className="flex min-w-0 grow flex-col">{children}</div> : children}
        {fieldMessage && (
          <FieldError className={cn("flex items-start gap-1", controlText, tone)}>
            <span className={controlLine}>
              <ErrorIcon aria-hidden className="h-5 w-5 fill-current lg:h-4 lg:w-4" />
            </span>
            <span id={`${id}--message`}>{fieldMessage}</span>
          </FieldError>
        )}
      </RegistryField>
    </FieldContext.Provider>
  );
}

const Field = (props: FieldProps) => <FieldShell {...props} subtle={false} />;
const InlineField = (props: FieldProps) => <FieldShell {...props} subtle />;

/** Undo the registry inputs' own focus ring in favour of EDS's border focus. */
const registryInputReset = "focus-visible:ring-0 focus-visible:ring-offset-0 aria-[invalid=true]:ring-0 data-[placeholder]:text-[color:var(--text-primary)]";

function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart, adornmentEnd, onKeyDown, onFocus, onBlur }: TextInputProps) {
  const field = useContext(FieldContext);
  return (
    <div className="relative flex w-full min-w-0 items-center">
      {adornmentStart && <span className="pointer-events-none absolute left-3 flex items-center text-[color:var(--text-primary)] lg:left-2">{adornmentStart}</span>}
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
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          "h-10 px-[11px] py-0 md:text-[14px] lg:h-8 lg:px-[7px]",
          edsInputBox,
          edsInputText,
          registryInputReset,
          adornmentStart && "pl-[39px] lg:pl-[29px]",
          adornmentEnd && "pr-8",
          field?.subtle && edsSubtle
        )}
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
      adornmentStart={<SearchIcon aria-hidden className="h-5 w-5 fill-current lg:h-4 lg:w-4" />}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClear) onClear();
      }}
      adornmentEnd={
        onClear && value ? (
          <button type="button" aria-label="Clear search" onClick={onClear} className="flex rounded-full text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
            <RemoveIcon aria-hidden className="h-4 w-4 fill-current" />
          </button>
        ) : null
      }
    />
  );
}

function Textarea({ value, onChange, placeholder }: TextareaProps) {
  const field = useContext(FieldContext);
  return (
    <RegistryTextarea
      id={field?.id}
      // eds-core's Textarea always shows 3 rows; matched here.
      rows={3}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn("min-h-0 resize-none p-[11px] [field-sizing:fixed] md:text-[14px] lg:p-[7px]", edsInputBox, edsInputText, registryInputReset, field?.subtle && edsSubtle)}
    />
  );
}

/**
 * EDS SelectMenu is item-driven (each item has its own onClick and isSelected); the registry
 * Select is value-driven. Items register their onClick under a value, and the Select calls it.
 */
type SelectMenuCtx = { handlers: React.RefObject<Map<string, () => boolean | void>>; setSelected: (v: string) => void; open: boolean; maxWidth: number };
const SelectMenuContext = createContext<SelectMenuCtx | null>(null);

function itemValue(id: string | undefined, children: ReactNode) {
  if (id) return id;
  return Children.toArray(children).filter((c) => typeof c === "string" || typeof c === "number").join("");
}

function SelectMenu({ children, popoverMaxWidth = 400 }: SelectMenuProps) {
  const handlers = useRef(new Map<string, () => boolean | void>());
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <SelectMenuContext.Provider value={{ handlers, setSelected, open, maxWidth: popoverMaxWidth }}>
      <Select value={selected} open={open} onOpenChange={setOpen} onValueChange={(v) => v != null && handlers.current.get(String(v))?.()}>
        {typeof children === "function" ? children({ triggerProps: {}, isMenuOpen: open }) : children}
      </Select>
    </SelectMenuContext.Provider>
  );
}

/** EDS select trigger on the registry trigger; its own lucide chevron is swapped for EDS's. */
function SelectMenuTrigger({ children, placeholder }: SelectMenuTriggerProps) {
  const field = useContext(FieldContext);
  const ctx = useContext(SelectMenuContext);
  const Chevron = ctx?.open ? DropdownUpIcon : DropdownDownIcon;
  return (
    <SelectTrigger
      id={field?.id}
      className={cn(
        "h-10 w-full justify-between gap-1 whitespace-nowrap px-3 py-0 font-normal lg:h-8 lg:px-2 [&>svg:last-child]:hidden [&_svg]:size-5 lg:[&_svg]:size-4 data-[popup-open]:border-[color:var(--border-input-active)] data-[popup-open]:shadow-[inset_0_0_0_1px_var(--border-input-active)]",
        edsInputBox,
        edsInputText,
        registryInputReset,
        field?.subtle && "w-auto border-transparent"
      )}
    >
      <span className={cn("min-w-0 grow truncate text-start", !children && "text-[color:var(--text-secondary)]")}>{children ?? placeholder}</span>
      <Chevron aria-hidden className="shrink-0 fill-[color:var(--text-secondary)]" />
    </SelectTrigger>
  );
}

function SelectMenuPopover({ children }: { children: ReactNode }) {
  const ctx = useContext(SelectMenuContext);
  return (
    <SelectContent
      alignItemWithTrigger={false}
      align="start"
      sideOffset={4}
      className={cn("min-w-0 overflow-y-auto ring-0 animate-none data-[closed]:animate-none data-[open]:animate-none", edsPopoverSurface)}
      style={{ width: ctx?.maxWidth, maxWidth: ctx?.maxWidth, maxHeight: 356 }}
    >
      {children}
    </SelectContent>
  );
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
    // The registry's trailing tick is hidden; EDS puts its tick in a leading rail.
    <SelectItem value={value} disabled={isDisabled} className={cn(edsMenuItem, "w-full px-3 py-2 lg:px-2 lg:py-1.5 [&>span.absolute]:hidden")}>
      <span className="-me-1 -ms-1 inline-flex h-[22px] shrink-0 items-center lg:h-5">
        {isSelected ? <CheckIcon aria-hidden className="h-5 w-5 fill-current lg:h-4 lg:w-4" /> : <span className="h-5 w-5 lg:h-4 lg:w-4" />}
      </span>
      <span className="flex min-w-0 grow flex-col">{children}</span>
    </SelectItem>
  );
}

export const testKit: Kit = {
  // Fallbacks: the shadcn kit (EDS-dressed), including TimePicker — the registry has no time
  // picker, and its Select can't take typed times the way EDS's TimePicker does.
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
};
