"use client";

// EDS kit. Until @adaptavant/eds-core can be installed these are stand-ins styled after EDS;
// each one gets replaced by the real component (check `edscli view <name>` for its composition).
import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import type {
  AnchoredPopoverProps,
  AvatarProps,
  CheckboxProps,
  DatePickerProps,
  DropdownItemProps,
  DropdownProps,
  FieldProps,
  Kit,
  ModalProps,
  SelectProps,
  TextAreaProps,
  TextInputProps,
} from "../kit/types";
import { Button, IconButton } from "./Button";
import { CalendarNavIcon, CheckIcon, CloseIcon } from "../calendar/icons";
import { MiniMonth } from "../calendar/MiniMonth";
import { MONTHS, fromKey, toKey } from "../calendar/dates";

const control =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/25";

function Field({ label, description, children }: FieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      {children}
      {description && <span className="text-sm text-neutral-500">{description}</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", autoFocus, adornmentStart: Adornment }: TextInputProps) {
  return (
    <span className="relative flex items-center">
      {Adornment && <Adornment className="pointer-events-none absolute left-3 h-5 w-5 text-neutral-500" />}
      <input
        className={`${control} h-11 ${Adornment ? "pl-10" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
    </span>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <textarea
      className={`${control} resize-none py-2.5`}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select className={`${control} h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9`} style={{ backgroundImage: chevron }} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DatePicker({ value, onChange }: DatePickerProps) {
  const date = fromKey(value);
  return (
    <Dropdown
      width={300}
      trigger={
        <button type="button" className={`${control} flex h-11 items-center justify-between gap-2 text-left`}>
          <span className="truncate whitespace-nowrap">
            {MONTHS[date.getMonth()].slice(0, 3)} {date.getDate()}, {date.getFullYear()}
          </span>
          <CalendarNavIcon className="h-4 w-4 shrink-0 text-neutral-500" />
        </button>
      }
    >
      {(close) => (
        <MiniMonth
          selected={date}
          today={new Date()}
          onPick={(picked) => {
            onChange(toKey(picked));
            close();
          }}
        />
      )}
    </Dropdown>
  );
}

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

function Checkbox({ isChecked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-3 text-[15px] text-neutral-800">
      <input type="checkbox" className="peer sr-only" checked={isChecked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#171717]/40 ${
          isChecked ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-400 bg-white"
        }`}
      >
        {isChecked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

const avatarTints = ["bg-[#e8efe9] text-[#1f3d2c]", "bg-[#fdf0e6] text-[#6b3510]", "bg-[#e9f0fb] text-[#1d3a66]", "bg-[#f3e9fb] text-[#4a1d66]", "bg-[#fbecea] text-[#6e2115]"];

export function avatarTint(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return avatarTints[hash % avatarTints.length];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name, size = "standard" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${avatarTint(name)} ${
        size === "small" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm"
      }`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

function useDismiss(isOpen: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [isOpen, onClose, ref]);
}

function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(isOpen, onClose, ref);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div ref={ref} role="dialog" aria-modal aria-label={title} className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <IconButton icon={CloseIcon} label="Close" onClick={onClose} />
        </div>
        <div className="flex flex-col gap-4 px-6 py-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-5 pt-3">{footer}</div>}
      </div>
    </div>
  );
}

function Dropdown({ trigger, children, align = "start", width = 280 }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setIsOpen(false);
  useDismiss(isOpen, close, ref);
  const t = trigger as ReactElement<{ onClick?: () => void; "aria-expanded"?: boolean }>;

  return (
    <div ref={ref} className="relative">
      {cloneElement(t, { onClick: () => setIsOpen((o) => !o), "aria-expanded": isOpen })}
      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg ${align === "end" ? "right-0" : "left-0"}`}
          style={{ width }}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ onSelect, icon: ItemIcon, isSelected, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] text-neutral-800 hover:bg-neutral-100"
    >
      {ItemIcon && <ItemIcon className="h-5 w-5 text-neutral-600" />}
      <span className="flex-1">{children}</span>
      {isSelected && <CheckIcon className="h-4 w-4" />}
    </button>
  );
}

function AnchoredPopover({ anchor, onClose, children }: AnchoredPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(anchor !== null, onClose, ref);
  if (!anchor) return null;
  return (
    <div ref={ref} className="fixed z-40 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl" style={popoverPosition(anchor, 320)}>
      {children}
    </div>
  );
}

/** Opens beside the anchor (right if there is room, else left), kept inside the window. */
export function popoverPosition(anchor: DOMRect, width: number) {
  const gap = 8;
  const fitsRight = anchor.right + gap + width < window.innerWidth;
  const left = fitsRight ? anchor.right + gap : Math.max(gap, anchor.left - gap - width);
  const top = Math.min(Math.max(gap, anchor.top), window.innerHeight - 320);
  return { left, top };
}

export const edsKit: Kit = {
  name: "eds",
  label: "EDS",
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
