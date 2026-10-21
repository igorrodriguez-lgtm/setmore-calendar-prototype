// The building blocks every screen uses. Each kit (EDS, shadcn styled as EDS) provides all of them
// with the same EDS-shaped props, so screens never import a kit directly.
import type { ComponentType, ReactElement, ReactNode } from "react";
import type { ButtonProps, ButtonSize, ButtonVariant, Icon } from "../eds/Button";

export type { ButtonProps, Icon };

export type IconButtonProps = {
  icon: Icon;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type FieldProps = { label: string; description?: string; children: ReactNode };

export type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "search" | "time" | "date";
  autoFocus?: boolean;
  /** Icon shown inside the input, before the text. */
  adornmentStart?: Icon;
};

export type TextAreaProps = { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number };

export type SelectProps = { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] };

export type CheckboxProps = { isChecked: boolean; onChange: (checked: boolean) => void; label: ReactNode };

export type AvatarProps = { name: string; size?: "small" | "standard" };

export type ModalProps = { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };

export type DropdownProps = {
  trigger: ReactElement;
  /** Receives `close` so an item can shut the dropdown after it is chosen. */
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  width?: number;
};

export type DropdownItemProps = { onSelect?: () => void; icon?: Icon; isSelected?: boolean; children: ReactNode };

export type AnchoredPopoverProps = { anchor: DOMRect | null; onClose: () => void; children: ReactNode };

export type Kit = {
  name: "eds" | "shadcn";
  label: string;
  Button: ComponentType<ButtonProps>;
  IconButton: ComponentType<IconButtonProps>;
  Field: ComponentType<FieldProps>;
  TextInput: ComponentType<TextInputProps>;
  TextArea: ComponentType<TextAreaProps>;
  Select: ComponentType<SelectProps>;
  Checkbox: ComponentType<CheckboxProps>;
  Avatar: ComponentType<AvatarProps>;
  Modal: ComponentType<ModalProps>;
  Dropdown: ComponentType<DropdownProps>;
  DropdownItem: ComponentType<DropdownItemProps>;
  AnchoredPopover: ComponentType<AnchoredPopoverProps>;
};
