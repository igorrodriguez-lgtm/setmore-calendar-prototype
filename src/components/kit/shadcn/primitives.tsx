"use client";

// shadcn/ui behind the EDS-shaped API. Files in ../../shadcn come straight from the shadcn CLI
// and stay unedited; anything EDS-specific (pill buttons, sizes) is applied here.
import { Children, cloneElement, createContext, Fragment, isValidElement, useContext, useId, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Textarea as ShadTextarea } from "../../shadcn/textarea";
import { Label } from "../../shadcn/label";
import { Checkbox as ShadCheckbox } from "../../shadcn/checkbox";
import { Switch } from "../../shadcn/switch";
import { Avatar as ShadAvatar, AvatarFallback } from "../../shadcn/avatar";
import { Skeleton } from "../../shadcn/skeleton";
import { Tabs as ShadTabs, TabsContent, TabsList, TabsTrigger } from "../../shadcn/tabs";
import type {
  AvatarProps,
  ButtonProps,
  CheckboxProps,
  FieldProps,
  IconButtonProps,
  LoadingProps,
  PlaceholderProps,
  SearchInputProps,
  TabContentProps,
  TabItemProps,
  TabsProps,
  TextareaProps,
  TextInputProps,
  ToggleProps,
} from "../types";

const variantMap: Record<NonNullable<ButtonProps["variant"]>, { variant: ShadButtonProps["variant"]; className?: string }> = {
  accentPrimary: { variant: "default" },
  accentSecondary: { variant: "secondary" },
  criticalPrimary: { variant: "destructive" },
  criticalSecondary: { variant: "outline", className: "border-destructive text-destructive hover:text-destructive" },
  criticalTertiary: { variant: "ghost", className: "text-destructive hover:text-destructive" },
  inversePrimary: { variant: "outline", className: "border-transparent" },
  neutralPrimary: { variant: "default" },
  neutralSecondary: { variant: "outline" },
  neutralSecondaryIntense: { variant: "outline", className: "border-foreground" },
  neutralTertiary: { variant: "ghost" },
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, { size: ShadButtonProps["size"]; className: string; square: string }> = {
  small: { size: "sm", className: "h-7 px-3 text-xs", square: "h-7 w-7" },
  standard: { size: "default", className: "h-9", square: "h-9 w-9" },
  large: { size: "lg", className: "h-10 px-5", square: "h-10 w-10" },
  xLarge: { size: "lg", className: "h-12 px-6 text-base", square: "h-12 w-12" },
};

export function Button({ variant = "accentPrimary", size = "standard", iconStart: IconStart, iconEnd: IconEnd, isDisabled, isLoading, isPressed, loadingLabel, children, type = "button", className, ...rest }: ButtonProps) {
  const v = variantMap[variant];
  const s = sizeMap[size];
  return (
    <ShadButton
      type={type}
      variant={v.variant}
      size={s.size}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn("relative rounded-full", v.className, s.className, isPressed && "bg-accent", className)}
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
    </ShadButton>
  );
}

export function IconButton({ icon: Icon, variant = "accentPrimary", size = "standard", isDisabled, isLoading, isPressed, className, type = "button", loadingLabel, ...rest }: IconButtonProps) {
  const v = variantMap[variant];
  return (
    <ShadButton
      type={type}
      variant={v.variant}
      size="icon"
      title={rest["aria-label"]}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn("rounded-full", v.className, sizeMap[size].square, isPressed && "bg-accent", className)}
      {...rest}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Icon />}
    </ShadButton>
  );
}

const tints = ["#e7e7e7", "#d9ebfc", "#e2f3ed", "#ffede1", "#e5e0f3", "#fff7d9", "#f9e1d9", "#d9eaeb"];
/** Stable tint per name, so initials avatars aren't all grey. */
function avatarTint(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length];
}

export function Avatar({ name, size, status, className }: AvatarProps) {
  const px = Number(size);
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: px, height: px }}>
      <ShadAvatar className="h-full w-full">
        <AvatarFallback className="font-medium uppercase" style={{ background: avatarTint(name), fontSize: Math.max(8, px * 0.42) }}>
          {name.trim()[0]}
        </AvatarFallback>
      </ShadAvatar>
      {status && <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-background" style={{ background: `var(--status-${status})` }} />}
    </span>
  );
}

/** EDS inputs report changes as DOM events; Radix reports booleans. This bridges the two. */
function fakeChange(checked: boolean) {
  return { target: { checked }, currentTarget: { checked } } as unknown as ChangeEvent<HTMLInputElement>;
}

export function Checkbox({ label, checked, onChange, isDisabled, description, className }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <ShadCheckbox id={id} checked={checked} disabled={isDisabled} onCheckedChange={(c) => onChange?.(fakeChange(c === true))} />
      <Label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-xs font-normal">
        {label}
        {description && <span className="block text-muted-foreground">{description}</span>}
      </Label>
    </div>
  );
}

export function Toggle({ label, checked, onChange, isDisabled, togglePosition = "end", className }: ToggleProps) {
  const id = useId();
  const control = <Switch id={id} checked={checked} disabled={isDisabled} onCheckedChange={(c) => onChange?.(fakeChange(c))} />;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {togglePosition === "start" && control}
      <Label htmlFor={id} className="flex-1 cursor-pointer text-xs font-normal">
        {label}
      </Label>
      {togglePosition === "end" && control}
    </div>
  );
}

type FieldCtx = { id: string; subtle: boolean };
const FieldContext = createContext<FieldCtx | null>(null);
export const useShadField = () => useContext(FieldContext);

function FieldShell({ subtle, label, labelVisibility = "visible", description, status, fieldMessage, children, className }: FieldProps & { subtle: boolean }) {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id, subtle }}>
      <div className={cn("grid min-w-0 gap-1.5", subtle && "flex items-center gap-2", className)}>
        <Label htmlFor={id} className={labelVisibility === "hidden" ? "sr-only" : "text-xs"}>
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {children}
        {fieldMessage && <p className={cn("text-xs", status === "error" ? "text-destructive" : "text-orange-600")}>{fieldMessage}</p>}
      </div>
    </FieldContext.Provider>
  );
}

export const Field = (props: FieldProps) => <FieldShell {...props} subtle={false} />;
export const InlineField = (props: FieldProps) => <FieldShell {...props} subtle />;

export function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart, adornmentEnd, onKeyDown, onFocus, onBlur }: TextInputProps) {
  const field = useShadField();
  return (
    <div className="relative flex items-center">
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
        className={cn("h-8 text-xs md:text-xs", adornmentStart && "pl-8", adornmentEnd && "pr-8", field?.subtle && "border-transparent shadow-none hover:border-input")}
      />
      {adornmentEnd && <span className="absolute right-2 flex items-center">{adornmentEnd}</span>}
    </div>
  );
}

export function SearchInput({ onClear, value, ...props }: SearchInputProps) {
  return (
    <TextInput
      {...props}
      value={value}
      type="search"
      adornmentStart={<Search className="h-3.5 w-3.5" />}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClear) onClear();
      }}
      adornmentEnd={
        onClear && value ? (
          <button type="button" aria-label="Clear search" onClick={onClear} className="rounded-sm opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null
      }
    />
  );
}

export function Textarea({ value, onChange, placeholder, row = 3 }: TextareaProps) {
  const field = useShadField();
  return <ShadTextarea id={field?.id} rows={row} value={value} onChange={onChange} placeholder={placeholder} className="text-xs md:text-xs" />;
}

export function Tabs({ selectedValue, onSelectedValueChange, defaultValue, children, className }: TabsProps) {
  return (
    <ShadTabs value={selectedValue} onValueChange={onSelectedValueChange} defaultValue={defaultValue} className={className}>
      {children}
    </ShadTabs>
  );
}
export const TabList = ({ children }: { children: ReactNode }) => <TabsList className="h-8">{children}</TabsList>;
export const TabItem = ({ value, disabled, children }: TabItemProps) => (
  <TabsTrigger value={value} disabled={disabled} className="px-2.5 py-1 text-xs">
    {children}
  </TabsTrigger>
);
export const TabContent = ({ value, children, className }: TabContentProps) => (
  <TabsContent value={value} className={cn("mt-3", className)}>
    {children}
  </TabsContent>
);

export function Loading({ size = "24" }: LoadingProps) {
  return <Loader2 role="status" aria-label="Loading" className="animate-spin text-muted-foreground" style={{ width: Number(size), height: Number(size) }} />;
}

export function Placeholder({ lines = 3, avatar, className }: PlaceholderProps) {
  return (
    <div className={cn("flex flex-col gap-2 py-2", className)} aria-busy aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          {avatar && <Skeleton className="h-6 w-6 shrink-0 rounded-full" />}
          <Skeleton className="h-3" style={{ width: `${85 - i * 12}%` }} />
        </div>
      ))}
    </div>
  );
}

/**
 * EDS render-prop triggers hand out `triggerProps` to spread on any element. Radix instead wants
 * the trigger wrapped in its own <X.Trigger asChild>. Screens spread a marker; this finds the
 * marked element in what the render function returned and wraps it.
 */
export const TRIGGER_MARKER = "data-kit-trigger";

export function wrapMarkedTrigger(node: ReactNode, wrap: (el: ReactElement) => ReactElement): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const props = child.props as Record<string, unknown>;
    if (props[TRIGGER_MARKER]) return wrap(cloneElement(child as ReactElement<Record<string, unknown>>, { [TRIGGER_MARKER]: undefined }));
    if (child.type === Fragment || typeof child.type === "string") {
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, undefined, wrapMarkedTrigger(props.children as ReactNode, wrap));
    }
    return child;
  });
}
