"use client";

// shadcn/ui behind the EDS-shaped API. Files in ../../shadcn come straight from the shadcn CLI
// and stay unedited; anything EDS-specific (pill buttons, sizes) is applied here.
import { Children, cloneElement, createContext, Fragment, isValidElement, useContext, useId, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { CheckboxCheckIcon, ErrorIcon, RemoveIcon, SearchIcon } from "@adaptavant/eds-core";
import { cn } from "@/lib/utils";
import { Button as ShadButton } from "../../shadcn/button";
import { edsButtonBase, edsButtonSize, edsButtonVariant } from "./eds-look";
import { Input } from "../../shadcn/input";
import { Textarea as ShadTextarea } from "../../shadcn/textarea";
import { Label } from "../../shadcn/label";
import { Checkbox as ShadCheckbox } from "../../shadcn/checkbox";
import { Switch } from "../../shadcn/switch";
import { Avatar as ShadAvatar, AvatarFallback } from "../../shadcn/avatar";
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

/** Shared EDS dressing (see eds-look.ts); the shadcn Button keeps its structure and behaviour. */
export function edsButtonClass(variant: NonNullable<ButtonProps["variant"]>, size: NonNullable<ButtonProps["size"]>, square: boolean) {
  const s = edsButtonSize[size];
  return cn(edsButtonBase, square ? s.square : s.button, s.icon, edsButtonVariant[variant]);
}

export function Button({ variant = "accentPrimary", size = "standard", iconStart: IconStart, iconEnd: IconEnd, isDisabled, isLoading, isPressed, loadingLabel, children, type = "button", className, ...rest }: ButtonProps) {
  return (
    <ShadButton
      type={type}
      variant="ghost"
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn(edsButtonClass(variant, size, false), className)}
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
    </ShadButton>
  );
}

export function IconButton({ icon: Icon, variant = "accentPrimary", size = "standard", isDisabled, isLoading, isPressed, className, type = "button", loadingLabel, ...rest }: IconButtonProps) {
  return (
    <ShadButton
      type={type}
      variant="ghost"
      size="icon"
      title={rest["aria-label"]}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      className={cn(edsButtonClass(variant, size, true), "shrink-0", className)}
      {...rest}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Icon />}
    </ShadButton>
  );
}

const avatarText: Record<AvatarProps["size"], string> = {
  "16": "text-[8px] leading-[12px]",
  "20": "text-[10px] leading-[16px]",
  "24": "text-[10px] leading-[16px]",
  "32": "text-[12px] leading-[20px]",
  "40": "text-[14px] leading-[22px]",
  "48": "text-[14px] leading-[22px]",
  "64": "text-[16px] leading-[24px]",
  "96": "text-[20px] leading-[28px]",
};

export function Avatar({ name, size, status, className }: AvatarProps) {
  const px = Number(size);
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: px, height: px }}>
      <ShadAvatar className="h-full w-full rounded-full bg-[color:var(--background-avatar)]">
        <AvatarFallback className={cn("rounded-full bg-transparent font-normal uppercase text-[color:var(--text-primary)]", avatarText[size])}>{name.trim()[0]}</AvatarFallback>
      </ShadAvatar>
      {status && <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[color:var(--background-canvas)]" style={{ background: `var(--status-${status})` }} />}
    </span>
  );
}

/** EDS inputs report changes as DOM events; Radix reports booleans. This bridges the two. */
function fakeChange(checked: boolean) {
  return { target: { checked }, currentTarget: { checked } } as unknown as ChangeEvent<HTMLInputElement>;
}

/** EDS control rows: text-body-14 (12 from 1024px), the control centred on the first line of text. */
export const controlText = "text-[14px] leading-[22px] lg:text-[12px] lg:leading-[20px] font-normal";
export const controlLine = "flex h-[22px] shrink-0 items-center lg:h-5";

export function Checkbox({ label, checked, onChange, isDisabled, description, className }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 flex-col items-start", className)}>
      <Label htmlFor={id} className={cn("group flex min-w-0 items-start gap-3 lg:gap-2", controlText, isDisabled ? "text-[color:var(--text-disabled)]" : "cursor-pointer text-[color:var(--text-primary)]")}>
        <span className={cn(controlLine, "relative")}>
          {/* shadcn's own check glyph is hidden; EDS's check is drawn on top so the tick is identical. */}
          <ShadCheckbox
            id={id}
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={(c) => onChange?.(fakeChange(c === true))}
            className="peer h-5 w-5 rounded-[4px] border-[color:var(--border-input)] bg-[color:var(--background-canvas)] shadow-none transition-colors duration-300 hover:border-[color:var(--border-input-hover)] group-hover:border-[color:var(--border-input-hover)] focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-1 disabled:opacity-100 disabled:cursor-default lg:h-4 lg:w-4 data-[state=checked]:border-[color:var(--border-input-active)] data-[state=checked]:bg-[color:var(--background-inverse)] data-[state=checked]:text-transparent disabled:border-[color:var(--border-input-disabled)] disabled:bg-[color:var(--background-neutral-disabled)] disabled:data-[state=checked]:border-[color:var(--border-input-disabled)] disabled:data-[state=checked]:bg-[color:var(--background-neutral-disabled)] [&_svg]:hidden"
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
      </Label>
    </div>
  );
}

export function Toggle({ label, checked, onChange, isDisabled, togglePosition = "start", className }: ToggleProps) {
  const id = useId();
  const control = (
    <span className={controlLine}>
      <Switch
        id={id}
        checked={checked}
        disabled={isDisabled}
        onCheckedChange={(c) => onChange?.(fakeChange(c))}
        className="h-5 w-9 border border-transparent px-px shadow-none transition-colors focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-1 disabled:cursor-default disabled:opacity-100 lg:h-4 lg:w-7 data-[state=unchecked]:bg-[color:var(--background-neutral-tertiary)] data-[state=checked]:bg-[color:var(--background-inverse)] disabled:data-[state=unchecked]:bg-[color:var(--background-neutral-disabled)] disabled:data-[state=checked]:bg-[color:var(--background-neutral-disabled)] [&:disabled>span]:bg-[color:var(--text-onPrimary-disabled)] [&>span]:h-4 [&>span]:w-4 [&>span]:bg-[color:var(--text-onPrimary)] [&>span]:shadow-none [&>span]:duration-300 lg:[&>span]:h-3 lg:[&>span]:w-3 [&>span]:data-[state=unchecked]:translate-x-0 [&>span]:data-[state=checked]:translate-x-4 lg:[&>span]:data-[state=checked]:translate-x-3"
      />
    </span>
  );
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <Label htmlFor={id} className={cn("group flex items-start gap-2", controlText, isDisabled ? "text-[color:var(--text-disabled)]" : "cursor-pointer text-[color:var(--text-primary)]")}>
        {togglePosition === "start" && control}
        <span className="flex min-w-0 grow flex-col">{label}</span>
        {togglePosition === "end" && control}
      </Label>
    </div>
  );
}

type FieldCtx = { id: string; subtle: boolean; invalid: boolean; describedBy?: string };
const FieldContext = createContext<FieldCtx | null>(null);
export const useShadField = () => useContext(FieldContext);

function FieldShell({ subtle, label, labelVisibility = "visible", secondaryLabel, description, status, fieldMessage, children, className }: FieldProps & { subtle: boolean }) {
  const id = useId();
  const invalid = status === "error";
  const describedBy = [description && `${id}--description`, fieldMessage && `${id}--message`].filter(Boolean).join(" ") || undefined;
  return (
    <FieldContext.Provider value={{ id, subtle, invalid, describedBy }}>
      {/* EDS InlineField: label column and control column side by side, 2px apart. */}
      <div className={cn("flex min-w-0 flex-col items-stretch gap-1", subtle && "flex-row gap-0.5", className)}>
        <div className={subtle ? "flex" : "contents"}>
          <Label htmlFor={id} className={cn("flex gap-1 text-[color:var(--text-primary)]", controlText, labelVisibility === "hidden" && "sr-only")}>
            {label}
            {secondaryLabel && <span className="break-normal text-[color:var(--text-secondary)]">{secondaryLabel}</span>}
          </Label>
        </div>
        {description && (
          <span id={`${id}--description`} className={cn("-mt-1 block text-[color:var(--text-secondary)]", controlText)}>
            {description}
          </span>
        )}
        {subtle ? <div className="flex min-w-0 grow flex-col">{children}</div> : children}
        {fieldMessage && (
          <div className={cn("flex items-start gap-1", controlText)}>
            <span className={controlLine}>
              <ErrorIcon aria-hidden className={cn("h-5 w-5 fill-current lg:h-4 lg:w-4", invalid ? "text-[color:var(--text-critical)]" : "text-[color:var(--text-caution)]")} />
            </span>
            <span id={`${id}--message`} className={invalid ? "text-[color:var(--text-critical)]" : "text-[color:var(--text-caution)]"}>
              {fieldMessage}
            </span>
          </div>
        )}
      </div>
    </FieldContext.Provider>
  );
}

export const Field = (props: FieldProps) => <FieldShell {...props} subtle={false} />;
export const InlineField = (props: FieldProps) => <FieldShell {...props} subtle />;

/**
 * EDS input box: 8px corners, a 1px border (critical when invalid) that turns 2px and dark on
 * keyboard focus without shifting the text, 40px tall (32px from 1024px wide).
 */
export const edsInputBox =
  "rounded-[8px] border border-[color:var(--border-input)] bg-[color:var(--background-canvas)] shadow-none transition-colors duration-300 hover:border-[color:var(--border-input-hover)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[color:var(--border-input-active)] focus-visible:shadow-[inset_0_0_0_1px_var(--border-input-active)] aria-[invalid=true]:border-[color:var(--border-input-critical)] aria-[invalid=true]:hover:border-[color:var(--border-input-critical-hover)]";
export const edsSubtle =
  "border-transparent hover:border-transparent hover:bg-[color:var(--background-neutral-hover)] focus-visible:bg-[color:var(--background-canvas)] focus-visible:border-[color:var(--border-input-active)]";
export const edsInputText = "text-[14px] leading-[22px] lg:text-[12px] lg:leading-[20px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]";

export function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart, adornmentEnd, onKeyDown, onFocus, onBlur }: TextInputProps) {
  const field = useShadField();
  return (
    <div className="relative flex min-w-0 items-center">
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
          adornmentStart && "pl-[39px] lg:pl-[29px]",
          adornmentEnd && "pr-8",
          field?.subtle && edsSubtle
        )}
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

export function Textarea({ value, onChange, placeholder }: TextareaProps) {
  const field = useShadField();
  return (
    <ShadTextarea
      id={field?.id}
      // eds-core's Textarea takes no row count and always shows 3 rows; matched here.
      rows={3}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn("min-h-0 resize-none p-[11px] md:text-[14px] lg:p-[7px]", edsInputBox, edsInputText, field?.subtle && edsSubtle)}
    />
  );
}

const TabsSize = createContext<TabsProps["size"]>("standard");

export function Tabs({ selectedValue, onSelectedValueChange, defaultValue, size = "standard", children, className }: TabsProps) {
  return (
    <TabsSize.Provider value={size}>
    <ShadTabs value={selectedValue} onValueChange={onSelectedValueChange} defaultValue={defaultValue} className={cn("w-full", className)}>
      {children}
    </ShadTabs>
    </TabsSize.Provider>
  );
}
/** EDS tabs: text tabs 16px apart with a 2px underline under the selected one. */
export const TabList = ({ children }: { children: ReactNode }) => (
  <TabsList className="relative h-auto w-full justify-start gap-4 rounded-none bg-transparent px-1 py-1.5 text-[color:var(--text-secondary)]">{children}</TabsList>
);
/** Small tabs use 12px text and a 1.5px underline. */
export const TabItem = ({ value, disabled, children }: TabItemProps) => (
  <TabsTrigger
    value={value}
    disabled={disabled}
    className={cn(
      useContext(TabsSize) === "small" ? "text-[12px] leading-[20px] after:h-[1.5px]" : "text-[14px] leading-[22px] after:h-0.5",
      "relative rounded-[6px] px-0.5 py-0 font-medium text-[color:var(--text-secondary)] shadow-none ring-offset-0 transition-none after:absolute after:inset-x-0 after:-bottom-1.5 after:rounded-[4px] hover:text-[color:var(--text-secondary-hover)] focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] disabled:text-[color:var(--text-disabled)] disabled:opacity-100 data-[state=active]:bg-transparent data-[state=active]:text-[color:var(--text-primary)] data-[state=active]:shadow-none data-[state=active]:after:bg-[color:var(--background-inverse)]"
    )}
  >
    {children}
  </TabsTrigger>
);
export const TabContent = ({ value, children, className }: TabContentProps) => (
  <TabsContent value={value} className={cn("mt-0 data-[state=inactive]:hidden", className)}>
    {children}
  </TabsContent>
);

/** EDS's spinner (shadcn has none): same SVG and animation as eds-core's Loading. */
export function Loading({ size = "24" }: LoadingProps) {
  return (
    <div role="status" aria-label="Loading" className="relative shrink-0 stroke-2" style={{ width: Number(size), height: Number(size) }}>
      <svg viewBox="0 0 50 50" className="block animate-loading-spin" aria-hidden>
        <circle cx="25" cy="25" r="20" fill="none" strokeLinecap="round" className="animate-loading-dash stroke-[color:var(--icon-accent)]" />
      </svg>
    </div>
  );
}

/** EDS shows its spinner where shadcn would use skeletons, so every kit shows the same loading state. */
export function Placeholder({ className }: PlaceholderProps) {
  return (
    <div className={cn("flex items-center justify-center py-4", className)} aria-busy>
      <Loading size="20" />
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
