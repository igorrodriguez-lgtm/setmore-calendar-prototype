// The component API every screen codes against. Names, parts and props follow the EDS docs
// (earth.anywhere.co) so the EDS kit can later re-export @adaptavant/eds-core directly.
// The shadcn kit implements the same API with shadcn/ui components.
import type { ChangeEvent, ComponentType, CSSProperties, ReactElement, ReactNode, Ref } from "react";

/** An icon component reference (EDS icon or lucide icon), passed as `icon={AddIcon}`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Icon = ComponentType<any>;

export type ButtonVariant =
  | "accentPrimary"
  | "accentSecondary"
  | "criticalPrimary"
  | "criticalSecondary"
  | "criticalTertiary"
  | "inversePrimary"
  | "neutralPrimary"
  | "neutralSecondary"
  | "neutralSecondaryIntense"
  | "neutralTertiary";
export type ButtonSize = "xLarge" | "large" | "standard" | "small";

type Aria = {
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
};

export type ButtonProps = Aria & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: Icon;
  iconEnd?: Icon;
  loadingLabel?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isPressed?: boolean;
  children?: ReactNode;
  id?: string;
  type?: "button" | "submit" | "reset";
  form?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  /** Extrinsic layout only (margin, width, placement), per the EDS styling boundary. */
  className?: string;
  ref?: Ref<HTMLButtonElement>;
};

export type IconButtonProps = Omit<ButtonProps, "iconStart" | "iconEnd" | "children"> & {
  icon: Icon;
  "aria-label": string;
};

export type AvatarSize = "16" | "20" | "24" | "32" | "40" | "48" | "64" | "96";
export type AvatarProps = {
  name: string;
  size: AvatarSize;
  status?: "available" | "away" | "offline" | "busy";
  variant?: "neutral" | "inverse";
  className?: string;
};

export type CheckboxProps = {
  label: ReactNode;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  size?: "standard" | "large";
  description?: ReactNode;
  className?: string;
};

export type ToggleProps = CheckboxProps & { togglePosition?: "start" | "end" };

export type FieldProps = {
  label: ReactNode;
  labelVisibility?: "hidden" | "visible";
  secondaryLabel?: ReactNode;
  description?: ReactNode;
  status?: "error" | "warning";
  fieldMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  size?: "standard" | "large";
  children: ReactNode;
  className?: string;
};

export type TextInputProps = {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "email" | "password" | "search" | "tel" | "text" | "url";
  autoFocus?: boolean;
  adornmentStart?: ReactNode;
  adornmentEnd?: ReactNode;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

export type SearchInputProps = Omit<TextInputProps, "adornmentStart" | "adornmentEnd" | "type"> & { onClear?: () => void };

export type TextareaProps = {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  row?: number;
};

export type TabsProps = {
  selectedValue?: string;
  onSelectedValueChange?: (value: string) => void;
  defaultValue?: string;
  size?: "small" | "standard";
  variant?: "default" | "pills";
  children: ReactNode;
  className?: string;
};
export type TabItemProps = { value: string; disabled?: boolean; children: ReactNode };
export type TabContentProps = { value: string; children: ReactNode; className?: string };

export type TriggerRenderProps = { triggerProps: Record<string, unknown>; isMenuOpen: boolean };

export type DropdownMenuProps = {
  children: ReactNode | ((props: TriggerRenderProps) => ReactNode);
  isDisabled?: boolean;
  popoverPlacement?: "bottom" | "bottom-start" | "bottom-end";
  popoverMaxWidth?: number;
  popoverMaxHeight?: number;
  popoverOffset?: number;
  popoverMatchReferenceWidth?: boolean;
  size?: "standard" | "large";
  strategy?: "absolute" | "fixed";
};
export type DropdownMenuTriggerProps = Omit<ButtonProps, "variant"> & { variant?: Exclude<ButtonVariant, "inversePrimary"> };
export type DropdownMenuPopoverProps = { children: ReactNode; shouldUsePortal?: boolean };
export type DropdownMenuListProps = { children: ReactNode };
export type DropdownMenuItemProps = {
  children: ReactNode;
  /** Returning false keeps the menu open. */
  onClick?: () => boolean | void;
  isDisabled?: boolean;
  railStart?: ReactNode;
  railEnd?: ReactNode;
  id?: string;
};

export type SelectMenuProps = Omit<DropdownMenuProps, "isDisabled" | "size"> & { titleForMobile?: string };
export type SelectMenuTriggerProps = { children?: ReactNode; placeholder?: string; iconStart?: Icon; iconEnd?: Icon };
export type SelectMenuItemProps = {
  children: ReactNode;
  isSelected?: boolean;
  onClick?: () => boolean | void;
  isDisabled?: boolean;
  railStart?: ReactNode;
  railEnd?: ReactNode;
  showSelectionIndicator?: boolean;
  id?: string;
};

export type TooltipProps = {
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  children: (props: { triggerProps: Record<string, unknown>; close: () => void }) => ReactNode;
};

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  titleId?: string;
  ariaLabel?: string;
  size?: number;
  closeButtonProps?: { label: string; onClick: () => void };
  children: ReactNode;
};
export type ModalPartProps = { children: ReactNode; className?: string };

export type AlertModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  confirmButtonProps: { label: string; onClick: () => void };
  cancelButtonProps: { label: string; onClick: () => void };
};

/** Viewport rectangle to anchor to (an appointment block, a grid slot). */
export type AnchorRect = { left: number; top: number; width: number; height: number };

/**
 * Not an EDS component: a convenience built from EDS Popover + usePopover + useClickAway
 * (and from shadcn Popover + PopoverAnchor) for popovers anchored to a grid rectangle.
 */
export type AnchoredPopoverProps = {
  anchor: AnchorRect | null;
  onClose: () => void;
  placement?: "right-start" | "bottom-start";
  width?: number;
  ariaLabel: string;
  children: ReactNode;
};

export type SnackbarProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "info" | "positive" | "critical" | "loading";
  placement: "top-start" | "top-end" | "bottom-start" | "bottom-end";
};

export type LoadingProps = { size?: "16" | "20" | "24" | "48" | "80"; tone?: "accentPrimary" | "neutralPrimary" };

/** Skeleton placeholder. EDS has no Skeleton; the EDS kit shows its Loading spinner instead. */
export type PlaceholderProps = { lines?: number; avatar?: boolean; className?: string };

export type CalendarProps = {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  visibleMonth?: Date;
  onVisibleMonthChange?: (month: Date) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hasTodayButton?: boolean;
  hasMonthPicker?: boolean;
  showOutsideDays?: boolean;
  size?: "small" | "standard";
  initialFocus?: boolean;
};

export type DatePickerProps = {
  calendar: (props: { close: (selected?: Date) => void }) => ReactElement;
  formattedValue?: ReactNode;
  placeholder: string;
  trigger?: (props: { triggerProps: Record<string, unknown>; isOpen: boolean; placeholder: string }) => ReactElement;
  onClose?: (selected?: Date) => void;
  shouldUsePortal?: boolean;
};

export type TimePickerOption = { time: string; dateObject: Date };
export type TimePickerProps = {
  label: ReactNode;
  labelVisibility?: "visible" | "hidden";
  format?: "12" | "24";
  interval?: 15 | 30 | 45 | 60;
  variant?: "standard" | "subtle";
  defaultValue?: Date;
  minValue?: Date;
  maxValue?: Date;
  onSelect: (result: { newOption?: TimePickerOption; inputState: "EMPTY" | "VALID" }) => void;
  shouldUsePortal?: boolean;
};

export type ColorSwatchesProps = {
  colors: string[];
  value: string;
  onChange?: (value: string) => void;
  size?: "20" | "24" | "28" | "32" | "36" | "40";
  rows?: number;
  ariaLabelPrefix?: string;
};

export type ComboboxOption = { id: string; value: string } & Record<string, unknown>;
export type ComboboxProps<T extends ComboboxOption = ComboboxOption> = {
  children: ReactNode;
  selectedKey: keyof T & string;
  selectedOption: T | undefined;
  onSelectionChange: (option: T | undefined) => void;
  inputValue?: string;
  onInputChange: (value: string) => void;
  onClose?: () => void;
  options: T[];
  menuTrigger?: "focus" | "input";
  popoverMatchReferenceWidth?: boolean;
};
export type ComboboxInputProps = { placeholder?: string; autoFocus?: boolean; adornmentStart?: ReactNode };
export type ComboboxListboxProps<T extends ComboboxOption = ComboboxOption> = {
  options: T[];
  noResultsFallback?: ReactNode;
  children: (item: T) => ReactNode;
};
export type ComboboxItemProps<T extends ComboboxOption = ComboboxOption> = { option: T; children: ReactNode };

export type StyleProps = { className?: string; style?: CSSProperties };

/** Icons the screens use. EDS kit: @adaptavant/eds-icons. shadcn kit: lucide-react (shadcn's default set). */
export const ICON_NAMES = [
  "day", "week", "month", "agenda", "team", "add", "createBooking", "addCustomer", "more", "share", "upload",
  "chevronLeft", "chevronRight", "chevronDown", "close", "video", "lock", "clock", "user", "notes", "location",
  "link", "help", "settings", "services", "connect", "customers", "updates", "academy", "timer", "check",
  "search", "edit", "duplicate", "delete", "reminder", "menu", "sidebar", "print", "stats", "info", "calendar",
] as const;
export type IconName = (typeof ICON_NAMES)[number];
/** Icons accept EDS's string sizes; lucide icons accept the same `size` prop. */
export type KitIcon = ComponentType<{ size?: "16" | "20" | "24"; className?: string; "aria-hidden"?: boolean }>;

export type Kit = {
  name: "eds" | "shadcn" | "test" | "new";
  label: string;
  icons: Record<IconName, KitIcon>;
  Button: ComponentType<ButtonProps>;
  IconButton: ComponentType<IconButtonProps>;
  Avatar: ComponentType<AvatarProps>;
  Checkbox: ComponentType<CheckboxProps>;
  Toggle: ComponentType<ToggleProps>;
  Field: ComponentType<FieldProps>;
  InlineField: ComponentType<FieldProps>;
  TextInput: ComponentType<TextInputProps>;
  SearchInput: ComponentType<SearchInputProps>;
  Textarea: ComponentType<TextareaProps>;
  Tabs: ComponentType<TabsProps>;
  TabList: ComponentType<{ children: ReactNode }>;
  TabItem: ComponentType<TabItemProps>;
  TabContent: ComponentType<TabContentProps>;
  DropdownMenu: ComponentType<DropdownMenuProps>;
  DropdownMenuTrigger: ComponentType<DropdownMenuTriggerProps>;
  DropdownMenuPopover: ComponentType<DropdownMenuPopoverProps>;
  DropdownMenuList: ComponentType<DropdownMenuListProps>;
  DropdownMenuItem: ComponentType<DropdownMenuItemProps>;
  SelectMenu: ComponentType<SelectMenuProps>;
  SelectMenuTrigger: ComponentType<SelectMenuTriggerProps>;
  SelectMenuPopover: ComponentType<DropdownMenuPopoverProps>;
  SelectMenuListbox: ComponentType<{ children: ReactNode }>;
  SelectMenuItem: ComponentType<SelectMenuItemProps>;
  Tooltip: ComponentType<TooltipProps>;
  Modal: ComponentType<ModalProps>;
  ModalHeader: ComponentType<ModalPartProps>;
  ModalContent: ComponentType<ModalPartProps>;
  ModalFooter: ComponentType<ModalPartProps>;
  AlertModal: ComponentType<AlertModalProps>;
  AnchoredPopover: ComponentType<AnchoredPopoverProps>;
  Snackbar: ComponentType<SnackbarProps>;
  Loading: ComponentType<LoadingProps>;
  Placeholder: ComponentType<PlaceholderProps>;
  Calendar: ComponentType<CalendarProps>;
  DatePicker: ComponentType<DatePickerProps>;
  TimePicker: ComponentType<TimePickerProps>;
  ColorSwatches: ComponentType<ColorSwatchesProps>;
  Combobox: ComponentType<ComboboxProps<any>>;
  ComboboxTextInput: ComponentType<ComboboxInputProps>;
  ComboboxPopover: ComponentType<{ children: ReactNode }>;
  ComboboxListbox: ComponentType<ComboboxListboxProps<any>>;
  ComboboxItem: ComponentType<ComboboxItemProps<any>>;
};
