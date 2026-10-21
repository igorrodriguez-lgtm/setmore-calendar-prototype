"use client";

// EDS Calendar / DatePicker / TimePicker / ColorSwatches / Combobox API, rendered with shadcn
// Calendar, Popover, Select and Command (shadcn's combobox pattern).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as ShadCalendar } from "../../shadcn/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shadcn/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../shadcn/command";
import { Button as ShadButton } from "../../shadcn/button";
import { Label } from "../../shadcn/label";
import type {
  CalendarProps,
  ColorSwatchesProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxListboxProps,
  ComboboxProps,
  DatePickerProps,
  TimePickerProps,
} from "../types";
import { TRIGGER_MARKER, useShadField, wrapMarkedTrigger } from "./primitives";

export function Calendar({ value, onValueChange, visibleMonth, onVisibleMonthChange, weekStartsOn = 1, showOutsideDays = true }: CalendarProps) {
  return (
    <ShadCalendar
      mode="single"
      selected={value}
      onSelect={(d) => onValueChange?.(d)}
      month={visibleMonth}
      onMonthChange={onVisibleMonthChange}
      defaultMonth={value}
      weekStartsOn={weekStartsOn}
      showOutsideDays={showOutsideDays}
    />
  );
}

export function DatePicker({ calendar, formattedValue, placeholder, trigger, onClose }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const field = useShadField();
  const close = (selected?: Date) => {
    setOpen(false);
    onClose?.(selected);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {trigger ? (
        wrapMarkedTrigger(trigger({ triggerProps: { [TRIGGER_MARKER]: true, id: field?.id }, isOpen: open, placeholder }), (el) => <PopoverTrigger asChild>{el}</PopoverTrigger>)
      ) : (
        <PopoverTrigger asChild>
          <ShadButton id={field?.id} variant="outline" className="h-8 w-full justify-start text-xs font-normal">
            {formattedValue ?? <span className="text-muted-foreground">{placeholder}</span>}
          </ShadButton>
        </PopoverTrigger>
      )}
      <PopoverContent className="w-auto p-0" align="start">
        {calendar({ close })}
      </PopoverContent>
    </Popover>
  );
}

function timeLabel(d: Date, format: "12" | "24") {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  if (format === "24") return `${String(h).padStart(2, "0")}:${m}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

export function TimePicker({ label, labelVisibility = "hidden", format = "12", interval = 60, variant = "standard", defaultValue, minValue, maxValue, onSelect }: TimePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(defaultValue);
  useEffect(() => setSelected(defaultValue), [defaultValue?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = defaultValue ?? new Date();
  const options = useMemo(() => {
    const out: Date[] = [];
    for (let m = 0; m < 24 * 60; m += interval) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), Math.floor(m / 60), m % 60);
      const mins = d.getHours() * 60 + d.getMinutes();
      if (minValue && mins < minValue.getHours() * 60 + minValue.getMinutes()) continue;
      if (maxValue && mins > maxValue.getHours() * 60 + maxValue.getMinutes()) continue;
      out.push(d);
    }
    return out;
  }, [interval, minValue, maxValue, base.getFullYear(), base.getMonth(), base.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="inline-flex flex-col gap-1">
      <Label className={labelVisibility === "hidden" ? "sr-only" : "text-xs"}>{label}</Label>
      <Select
        value={selected ? String(selected.getTime()) : undefined}
        onValueChange={(v) => {
          const d = options.find((o) => String(o.getTime()) === v);
          if (!d) return;
          setSelected(d);
          onSelect({ newOption: { time: timeLabel(d, format), dateObject: d }, inputState: "VALID" });
        }}
      >
        <SelectTrigger aria-label={typeof label === "string" ? label : "Time"} className={cn("h-7 w-auto gap-1 px-2 text-xs", variant === "subtle" && "border-transparent shadow-none hover:border-input [&>svg]:hidden")}>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((d) => (
            <SelectItem key={d.getTime()} value={String(d.getTime())} className="text-xs">
              {timeLabel(d, format)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** shadcn has no colour-swatch component; these are radio buttons styled with the shadcn theme. */
export function ColorSwatches({ colors, value, onChange, size = "32", rows = 1, ariaLabelPrefix = "Colour" }: ColorSwatchesProps) {
  const px = Number(size);
  return (
    <div role="radiogroup" aria-label={ariaLabelPrefix} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.ceil(colors.length / rows)}, ${px}px)` }}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={`${ariaLabelPrefix} ${c}`}
          onClick={() => onChange?.(c)}
          className={cn("relative rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value === c && "ring-2")}
          style={{ width: px, height: px, background: c, ["--tw-ring-color" as string]: c }}
        >
          {value === c && <Check className="absolute inset-0 m-auto h-3/5 w-3/5 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

type ComboCtx = ComboboxProps & { open: boolean; setOpen: (o: boolean) => void };
const ComboContext = createContext<ComboCtx | null>(null);

export function Combobox(props: ComboboxProps) {
  const [open, setOpenState] = useState(false);
  const setOpen = (o: boolean) => {
    setOpenState(o);
    if (!o) props.onClose?.();
  };
  return (
    <ComboContext.Provider value={{ ...props, open, setOpen }}>
      <Popover open={open} onOpenChange={setOpen}>
        {props.children}
      </Popover>
    </ComboContext.Provider>
  );
}

/** shadcn's combobox is a button that opens a searchable list, rather than an inline text input. */
export function ComboboxTextInput({ placeholder, adornmentStart }: ComboboxInputProps) {
  const ctx = useContext(ComboContext)!;
  const field = useShadField();
  const label = ctx.selectedOption ? String(ctx.selectedOption[ctx.selectedKey]) : undefined;
  return (
    <PopoverTrigger asChild>
      <ShadButton id={field?.id} variant="outline" role="combobox" aria-expanded={ctx.open} className="h-8 w-full justify-between gap-2 px-2.5 text-xs font-normal">
        <span className="flex min-w-0 items-center gap-2">
          {adornmentStart}
          <span className={cn("truncate", !label && "text-muted-foreground")}>{label ?? placeholder}</span>
        </span>
        <ChevronDown className="opacity-50" />
      </ShadButton>
    </PopoverTrigger>
  );
}

export function ComboboxPopover({ children }: { children: ReactNode }) {
  const ctx = useContext(ComboContext)!;
  return (
    <PopoverContent className="w-[--radix-popover-trigger-width] min-w-56 p-0" align="start">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search..." value={ctx.inputValue ?? ""} onValueChange={ctx.onInputChange} className="h-9 text-xs" />
        {children}
      </Command>
    </PopoverContent>
  );
}

export function ComboboxListbox({ options, noResultsFallback, children }: ComboboxListboxProps) {
  return (
    <CommandList>
      <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">{noResultsFallback ?? "No matching results"}</CommandEmpty>
      <CommandGroup>
        {options.map((o) => (
          <div key={o.id}>{children(o)}</div>
        ))}
      </CommandGroup>
    </CommandList>
  );
}

export function ComboboxItem({ option, children }: ComboboxItemProps) {
  const ctx = useContext(ComboContext)!;
  const isSelected = ctx.selectedOption?.id === option.id;
  return (
    <CommandItem
      value={option.id}
      onSelect={() => {
        ctx.onSelectionChange(option);
        ctx.setOpen(false);
      }}
      className="text-xs"
    >
      <span className="min-w-0 flex-1">{children}</span>
      {isSelected && <Check className="h-3.5 w-3.5" />}
    </CommandItem>
  );
}
