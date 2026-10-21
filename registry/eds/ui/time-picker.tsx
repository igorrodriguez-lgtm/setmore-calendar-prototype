"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

// EDS TimePicker (interval, format, min/max, subtle variant) rebuilt on Radix Popover.
// Unlike @adaptavant/eds-core, it is controlled: pass `value` and it updates from outside.

/** Minutes from midnight, e.g. 9:30 AM = 570. */
export type Minutes = number;

export type TimePickerProps = {
  label: string;
  labelVisibility?: "visible" | "hidden";
  value?: Minutes;
  onChange: (value: Minutes) => void;
  interval?: 15 | 30 | 45 | 60;
  format?: "12" | "24";
  minValue?: Minutes;
  maxValue?: Minutes;
  variant?: "standard" | "subtle";
  placeholder?: string;
  isDisabled?: boolean;
};

export function formatMinutes(m: Minutes, format: "12" | "24" = "12") {
  const h = Math.floor(m / 60) % 24;
  const mm = String(m % 60).padStart(2, "0");
  if (format === "24") return `${String(h).padStart(2, "0")}:${mm}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

function TimePicker({
  label,
  labelVisibility = "hidden",
  value,
  onChange,
  interval = 30,
  format = "12",
  minValue = 0,
  maxValue = 24 * 60 - 1,
  variant = "standard",
  placeholder = "Select time",
  isDisabled,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const options = React.useMemo(() => {
    const out: Minutes[] = [];
    for (let m = 0; m < 24 * 60; m += interval) if (m >= minValue && m <= maxValue) out.push(m);
    if (value !== undefined && !out.includes(value)) out.push(value);
    return out.sort((a, b) => a - b);
  }, [interval, minValue, maxValue, value]);

  // Scroll the selected time into view and focus it when the list opens.
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>("[aria-selected=true]") ?? listRef.current?.querySelector<HTMLElement>("[role=option]");
      el?.scrollIntoView({ block: "nearest" });
      el?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[role=option]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), items.length - 1)]?.focus();
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <label htmlFor={id} className={labelVisibility === "hidden" ? "sr-only" : "text-xs font-medium"}>
        {label}
      </label>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          id={id}
          disabled={isDisabled}
          aria-haspopup="listbox"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
            variant === "subtle" ? "border border-transparent hover:border-input" : "border border-input bg-background",
            open && "border-ring"
          )}
        >
          {variant === "standard" && <Clock className="size-4 text-muted-foreground" />}
          <span className={cn(value === undefined && "text-muted-foreground")}>{value === undefined ? placeholder : formatMinutes(value, format)}</span>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content align="start" sideOffset={4} className="z-50 max-h-60 w-32 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div ref={listRef} role="listbox" aria-label={label} onKeyDown={onKeyDown}>
              {options.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="option"
                  aria-selected={m === value}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                  className={cn("block w-full rounded-lg px-3 py-1.5 text-left text-sm outline-none hover:bg-accent focus:bg-accent", m === value && "bg-accent font-medium")}
                >
                  {formatMinutes(m, format)}
                </button>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export { TimePicker };
