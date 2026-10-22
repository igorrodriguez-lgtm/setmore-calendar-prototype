"use client";

// EDS Calendar / DatePicker / TimePicker / ColorSwatches / Combobox API, rendered with shadcn's
// Calendar (react-day-picker), Popover and Input, dressed to match eds-core pixel for pixel.
// Measurements were read from eds-core's rendered DOM; classes are written out in full so
// Tailwind's scanner finds them, and colours read EDS's own CSS variables.
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useDayPicker, type DayButton, type MonthCaption } from "react-day-picker";
// The small dropdown chevrons EDS uses in its calendar caption and combobox (not in the kit icon map).
import { DropdownDownIcon, DropdownUpIcon } from "@adaptavant/eds-core";
import { cn } from "@/lib/utils";
import { Calendar as ShadCalendar } from "../../shadcn/calendar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Input } from "../../shadcn/input";
import { Button as ShadButton } from "../../shadcn/button";
import { edsIcons } from "../../eds/icons";
import { edsButtonBase, edsButtonSize, edsButtonVariant } from "./eds-look";
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

/* ---------- Shared EDS recipes ---------- */

/** EDS Popover surface (bg-neutral, border-secondary, rounded-8px, shadow-20) without shadcn's zoom/fade; z-50 keeps it above shadcn dialogs. */
const popoverSurface =
  "z-50 w-auto rounded-[8px] border border-solid border-[color:var(--border-secondary)] bg-[color:var(--background-neutral)] text-[color:var(--text-primary)] shadow-[0_-1px_4px_0_rgba(88,104,116,0.12),0_4px_12px_0_rgba(88,104,116,0.16)] outline-none data-[state=open]:animate-none data-[state=closed]:animate-none";

/** EDS ListboxItem (SelectMenu / Combobox / TimePicker options). */
const optionClass =
  "relative flex cursor-pointer gap-3 whitespace-nowrap rounded-[4px] bg-[color:var(--background-neutral)] px-3 py-2 text-[14px] leading-[22px] outline-none transition-colors duration-300 ease-[ease] hover:bg-[color:var(--background-neutral-hover)] hover:[&:not([data-highlighted])]:bg-[color:var(--background-neutral)] data-[highlighted]:bg-[color:var(--background-neutral-secondary)] hover:data-[highlighted]:bg-[color:var(--background-neutral-hover)] active:bg-[color:var(--background-neutral-pressed)] active:data-[highlighted]:bg-[color:var(--background-neutral-pressed)] lg:gap-2 lg:px-2 lg:py-1.5 lg:text-[12px] lg:leading-[20px]";

/** EDS text field shell: the input plus an overlaid border that thickens on focus. */
const fieldShell = "group relative flex items-center overflow-hidden rounded-[8px] outline-0";
const fieldInput =
  "peer flex h-10 w-full min-w-0 grow rounded-none border-0 border-transparent bg-transparent py-0 text-[14px] leading-[22px] text-[color:var(--text-primary)] shadow-none outline-none placeholder:text-[color:var(--text-secondary)] focus-visible:outline-none focus-visible:ring-0 md:text-[14px] lg:h-8 lg:text-[12px] lg:leading-[20px]";
const fieldRing =
  "pointer-events-none absolute inset-0 rounded-[8px] border border-solid transition-colors duration-300 ease-[ease] peer-focus-visible:border-2 peer-focus-visible:border-[color:var(--border-input-active)]";

function SelectionIndicator({ isSelected }: { isSelected: boolean }) {
  const Check = edsIcons.check;
  return (
    <span className="inline-flex shrink-0">
      <span className="-me-1 -ms-1 inline-flex items-center">
        {"​"}
        <span className="flex h-0 items-center">
          {isSelected ? <Check size="16" className="h-5 w-5 fill-current lg:h-4 lg:w-4" aria-hidden /> : <span className="inline-block h-5 w-5 lg:h-4 lg:w-4" />}
        </span>
      </span>
    </span>
  );
}

/* ---------- Calendar ---------- */

const navButton = cn(edsButtonBase, edsButtonSize.large.square, edsButtonSize.large.icon, edsButtonVariant.neutralTertiary, "disabled:cursor-not-allowed");
const dayButton =
  "relative size-full cursor-[unset] rounded-[4px] bg-transparent text-[14px] font-normal leading-[14px] text-[color:var(--text-primary)] outline-none hover:bg-[color:var(--background-neutral-hover)] active:bg-[color:var(--background-neutral-pressed)] focus-visible:z-[2] focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--background-neutral)]";
const dayOutside = "text-[color:var(--text-secondary)]";
const dayToday =
  "font-semibold after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:translate-y-[8px] after:rounded-[12px] after:bg-[color:var(--background-inverse)]";
const daySelected =
  "z-[1] bg-[color:var(--background-inverse)] font-medium text-[color:var(--text-inverse)] hover:bg-[color:var(--background-inverse)] active:bg-[color:var(--background-inverse)]";
const daySelectedToday =
  "z-[1] bg-[color:var(--background-inverse)] font-semibold text-[color:var(--text-onPrimary)] hover:bg-[color:var(--background-inverse)] active:bg-[color:var(--background-inverse)] after:bg-[color:var(--background-canvas)]";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type MonthPickerState = { open: boolean; setOpen: (open: boolean) => void };
const MonthPickerContext = createContext<MonthPickerState | null>(null);

function EdsDayButton({ day, modifiers, className: _rdpClass, ...props }: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const state = modifiers.selected ? (modifiers.today ? daySelectedToday : daySelected) : modifiers.today ? dayToday : modifiers.outside ? dayOutside : "";
  return <button ref={ref} {...props} className={cn(dayButton, modifiers.today && dayToday, state)} />;
}

/** EDS's calendar header: a month/year button that opens a month grid, and previous/next on the right. */
function EdsMonthCaption({ calendarMonth, displayIndex: _index, className: _rdpClass, ...props }: ComponentProps<typeof MonthCaption>) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();
  const picker = useContext(MonthPickerContext)!;
  const gridId = useId();
  const shown = calendarMonth.date;
  const today = new Date();
  const ChevronLeft = edsIcons.chevronLeft;
  const ChevronRight = edsIcons.chevronRight;
  const year = shown.getFullYear();
  // In the month grid EDS's arrows move the shown month by a year.
  const step = (months: number) => goToMonth(new Date(year, shown.getMonth() + months, 1));

  return (
    <div {...props} className="flex w-full items-center">
      <div className="flex min-w-0 grow flex-col">
        <ShadButton
          type="button"
          variant="ghost"
          aria-haspopup="grid"
          aria-expanded={picker.open}
          aria-controls={gridId}
          onClick={() => picker.setOpen(!picker.open)}
          className={cn(
            edsButtonBase,
            edsButtonSize.standard.button,
            "w-fit border-transparent bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--background-neutral-hover)] hover:text-[color:var(--text-secondary)] active:bg-[color:var(--background-neutral-pressed)]"
          )}
        >
          <span className="pointer-events-none flex min-w-0 items-center gap-1">
            <span className="-my-1 line-clamp-1 flex min-w-0 grow flex-col py-1 text-[14px] font-semibold leading-[22px]">
              <span>
                <span className="text-[color:var(--text-primary)]">{MONTHS[shown.getMonth()]}</span>{" "}
                <span className="text-[color:var(--text-secondary)]">{year}</span>
              </span>
            </span>
            <span className="inline-flex shrink-0">
              {picker.open ? <DropdownUpIcon size="16" className="-me-1 h-4 w-4 fill-current" aria-hidden /> : <DropdownDownIcon size="16" className="-me-1 h-4 w-4 fill-current" aria-hidden />}
            </span>
          </span>
        </ShadButton>
      </div>
      <div className="inline-flex shrink-0">
        <div className="flex items-center gap-1">
          <ShadButton
            type="button"
            variant="ghost"
            size="icon"
            aria-label={picker.open ? "Previous year" : "Previous month"}
            disabled={!picker.open && !previousMonth}
            onClick={() => (picker.open ? step(-12) : previousMonth && goToMonth(previousMonth))}
            className={navButton}
          >
            <ChevronLeft size="20" aria-hidden />
          </ShadButton>
          <ShadButton
            type="button"
            variant="ghost"
            size="icon"
            aria-label={picker.open ? "Next year" : "Next month"}
            disabled={!picker.open && !nextMonth}
            onClick={() => (picker.open ? step(12) : nextMonth && goToMonth(nextMonth))}
            className={navButton}
          >
            <ChevronRight size="20" aria-hidden />
          </ShadButton>
        </div>
      </div>

      {picker.open && (
        <div id={gridId} role="grid" className="absolute inset-x-0 bottom-0 top-8 z-10 grid w-full grid-cols-3 grid-rows-4 content-center px-3 pb-4 pt-6">
          {MONTHS.map((name, i) => {
            const isShown = i === shown.getMonth();
            const isCurrent = i === today.getMonth() && year === today.getFullYear();
            return (
              <button
                key={name}
                type="button"
                name="month"
                aria-label={`${name} ${year}`}
                onClick={() => {
                  goToMonth(new Date(year, i, 1));
                  picker.setOpen(false);
                }}
                className={cn(
                  "flex h-9 w-full items-center justify-center rounded-[6px] text-[14px] leading-[14px] outline-none focus-visible:ring-[2px] focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--background-neutral)]",
                  isShown
                    ? "relative z-[1] bg-[color:var(--background-inverse)] font-semibold text-[color:var(--text-onPrimary)] hover:bg-[color:var(--background-inverse)]"
                    : "text-[color:var(--text-primary)] hover:bg-[color:var(--background-neutral-hover)]"
                )}
              >
                <span
                  className={cn(
                    "text-[14px] font-normal leading-[22px]",
                    isCurrent && "relative after:absolute after:-bottom-0.5 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-[12px]",
                    isCurrent && (isShown ? "after:bg-[color:var(--background-canvas)]" : "after:bg-[color:var(--background-inverse)]")
                  )}
                >
                  {name.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Calendar({ value, onValueChange, visibleMonth, onVisibleMonthChange, weekStartsOn = 1, showOutsideDays = true }: CalendarProps) {
  const [open, setOpen] = useState(false);
  return (
    <MonthPickerContext.Provider value={{ open, setOpen }}>
      <ShadCalendar
        mode="single"
        selected={value}
        onSelect={(d) => onValueChange?.(d)}
        month={visibleMonth}
        onMonthChange={onVisibleMonthChange}
        defaultMonth={value}
        weekStartsOn={weekStartsOn}
        showOutsideDays={showOutsideDays}
        fixedWeeks
        hideNavigation
        className="bg-transparent p-0"
        formatters={{ formatWeekdayName: (d) => d.toLocaleDateString("en-US", { weekday: "narrow" }) }}
        classNames={{
          root: "rdp-root relative w-fit text-[14px] leading-[22px]",
          months: "relative",
          month: "",
          month_caption: "flex h-10 w-full items-center",
          month_grid: cn("mt-1.5 border-separate border-spacing-0", open && "invisible"),
          weekdays: "flex items-center justify-between",
          weekday: "flex size-11 items-center justify-center border-none p-0 text-[14px] font-normal leading-[22px] text-[color:var(--text-secondary)]",
          weeks: "flex flex-col gap-2",
          week: "flex items-center justify-between",
          day: "relative flex size-11 items-center justify-center rounded-[4px] border-none p-0",
          today: "",
          outside: "",
          selected: "",
          disabled: "",
          hidden: "invisible",
        }}
        components={{ DayButton: EdsDayButton, MonthCaption: EdsMonthCaption }}
      />
    </MonthPickerContext.Provider>
  );
}

/* ---------- DatePicker ---------- */

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
          <button id={field?.id} type="button" className={cn(fieldShell, "h-10 w-full bg-[color:var(--background-canvas)] px-3 text-left text-[14px] lg:h-8 lg:px-2 lg:text-[12px]")}>
            {formattedValue ?? <span className="text-[color:var(--text-secondary)]">{placeholder}</span>}
            <span className={cn(fieldRing, "border-[color:var(--border-input)] group-hover:border-[color:var(--border-input-hover)]")} />
          </button>
        </PopoverTrigger>
      )}
      <PopoverContent className={cn(popoverSurface, "flex items-center px-3 py-3.5")} align="start" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
        {calendar({ close })}
      </PopoverContent>
    </Popover>
  );
}

/* ---------- Shared listbox popover (TimePicker and Combobox) ---------- */

type ListItem = { key: string; disabled?: boolean };

/** Keyboard + highlight state for an input that drives a listbox in a popover (react-aria style). */
function useListbox<T extends ListItem>(items: T[], selectedKey: string | undefined, onPick: (item: T) => void) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  // Like EDS: opening highlights the chosen option, or nothing until the arrow keys are used.
  const show = () => {
    setHighlighted(selectedKey);
    setOpen(true);
  };
  // Keep the highlighted option in view, aligned to the nearest edge like react-aria. The popover
  // content mounts a frame after opening, so wait for it; only the list scrolls, never the page.
  useEffect(() => {
    if (!open || !highlighted) return;
    const frame = requestAnimationFrame(() => {
      const list = listRef.current;
      const el = list?.querySelector<HTMLElement>(`[data-key="${CSS.escape(highlighted)}"]`);
      if (!list || !el) return;
      const top = el.offsetTop - list.offsetTop;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (top + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + el.offsetHeight - list.clientHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [open, highlighted]);
  useEffect(() => {
    if (open && highlighted && !items.some((i) => i.key === highlighted)) setHighlighted(items[0]?.key);
  }, [items, open, highlighted]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const enabled = items.filter((i) => !i.disabled);
    const at = enabled.findIndex((i) => i.key === highlighted);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        show();
        if (!selectedKey) setHighlighted(enabled[0]?.key);
        return;
      }
      const next = e.key === "ArrowDown" ? Math.min(at + 1, enabled.length - 1) : Math.max(at - 1, 0);
      setHighlighted(enabled[next]?.key);
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      const item = enabled[at];
      if (item) onPick(item);
      else setOpen(false);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };
  return { open, setOpen, show, highlighted, setHighlighted, listRef, onKeyDown };
}

function ListboxPopover({
  open,
  onOpenChange,
  anchorRef,
  listRef,
  listId,
  matchWidth,
  className,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  listId: string;
  matchWidth?: boolean;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PopoverContent
      align="start"
      sideOffset={4}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      onInteractOutside={(e) => {
        if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
      }}
      onEscapeKeyDown={() => onOpenChange(false)}
      className={cn(popoverSurface, "flex flex-col overflow-hidden p-1", matchWidth && "w-[--radix-popover-trigger-width]", className)}
    >
      <div ref={listRef} id={listId} role="listbox" tabIndex={-1} className="flex flex-col overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 outline-none md:pb-0 md:pt-0">
        {children}
      </div>
      {footer}
    </PopoverContent>
  );
}

/* ---------- TimePicker ---------- */

function timeLabel(d: Date, format: "12" | "24") {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  if (format === "24") return `${String(h).padStart(2, "0")}:${m}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}
const squash = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/** EDS TimePicker: a typeable time field whose options open in a listbox. */
export function TimePicker({ label, labelVisibility = "hidden", format = "12", interval = 60, variant = "standard", defaultValue, minValue, maxValue, onSelect }: TimePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(defaultValue);
  const [text, setText] = useState(defaultValue ? timeLabel(defaultValue, format) : "");
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

  const items = useMemo(() => options.map((d) => ({ key: timeLabel(d, format), date: d })), [options, format]);
  const pick = (item: { key: string; date: Date }) => {
    setSelected(item.date);
    setText(item.key);
    list.setOpen(false);
    onSelect({ newOption: { time: item.key, dateObject: item.date }, inputState: "VALID" });
  };
  const list = useListbox(items, selected ? timeLabel(selected, format) : undefined, pick);
  const anchorRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const subtle = variant === "subtle";

  const commitTyped = () => {
    const match = options.find((d) => squash(timeLabel(d, format)) === squash(text));
    if (match && match.getTime() !== selected?.getTime()) pick({ key: timeLabel(match, format), date: match });
    else setText(selected ? timeLabel(selected, format) : "");
  };

  return (
    <div className={cn(subtle ? "flex items-stretch gap-0.5" : "flex flex-col items-stretch gap-1", "lg:w-24")}>
      {subtle ? (
        <div className="inline-flex shrink-0">
          <label htmlFor={id} className={labelVisibility === "hidden" ? "sr-only" : "py-1.5 text-[14px] leading-[22px] text-[color:var(--text-secondary)] lg:text-[12px] lg:font-medium lg:leading-[20px]"}>
            {label}
          </label>
        </div>
      ) : (
        <label htmlFor={id} className={labelVisibility === "hidden" ? "sr-only" : "text-[14px] leading-[22px] lg:text-[12px] lg:leading-[20px]"}>
          {label}
        </label>
      )}
      <Popover open={list.open} onOpenChange={(o) => (o ? list.show() : (list.setOpen(false), commitTyped()))}>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className={cn(fieldShell, subtle ? "hover:bg-[color:var(--background-neutral-hover)] hover:focus-within:bg-transparent" : "bg-[color:var(--background-canvas)]", subtle && "min-w-0 grow")}>
            <div className="flex min-w-0 grow flex-col">
              <Input
                id={id}
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-expanded={list.open}
                aria-controls={list.open ? listId : undefined}
                aria-activedescendant={list.open && list.highlighted ? `${listId}-${list.highlighted}` : undefined}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={format === "12" ? "h:mm a" : "HH:mm"}
                value={text}
                onChange={(e) => {
                  // Like EDS: the list isn't filtered; the first time starting with what's typed is highlighted.
                  const typed = e.target.value;
                  setText(typed);
                  if (!list.open) list.show();
                  const start = typed.trimStart();
                  list.setHighlighted(start ? items.find((i) => i.key.startsWith(start))?.key : undefined);
                }}
                onClick={() => !list.open && list.show()}
                onKeyDown={list.onKeyDown}
                onBlur={() => !list.open && commitTyped()}
                className={cn(fieldInput, "pe-3 ps-3 lg:pe-2 lg:ps-2")}
              />
              <span className={cn(fieldRing, subtle ? "border-transparent" : "border-[color:var(--border-input)] group-hover:border-[color:var(--border-input-hover)]")} />
            </div>
          </div>
        </PopoverAnchor>
        <ListboxPopover
          open={list.open}
          onOpenChange={(o) => !o && (list.setOpen(false), commitTyped())}
          anchorRef={anchorRef}
          listRef={list.listRef}
          listId={listId}
          className="max-h-[205px] min-w-[104px] max-w-[400px] w-max"
        >
          {items.map((item) => {
            const isSelected = item.date.getTime() === selected?.getTime();
            return (
              <div
                key={item.key}
                id={`${listId}-${item.key}`}
                data-key={item.key}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                data-selected={isSelected || undefined}
                data-highlighted={list.highlighted === item.key || undefined}
                onPointerMove={() => list.setHighlighted(item.key)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                className={cn(optionClass, "items-start justify-center tabular-nums")}
              >
                <SelectionIndicator isSelected={isSelected} />
                <div className="flex min-w-0 grow flex-col">
                  <div className="flex gap-1 lg:items-baseline">
                    <span className="me-1 w-16 sm:w-14 lg:ms-auto lg:text-right">{item.key}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </ListboxPopover>
      </Popover>
    </div>
  );
}

/* ---------- ColorSwatches ---------- */

/** EDS ColorSwatches: radio inputs with a ring that darkens when chosen (shadcn has no swatch component). */
export function ColorSwatches({ colors, value, onChange, size = "32", rows = 1, ariaLabelPrefix = "Colour" }: ColorSwatchesProps) {
  const name = useId();
  const px = Number(size);
  return (
    <div role="radiogroup" aria-label={ariaLabelPrefix} className="grid w-fit" style={{ gridTemplateColumns: `repeat(${Math.ceil(colors.length / rows)}, ${px + 8}px)` }}>
      {colors.map((c) => (
        <label key={c} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={c}
            checked={value === c}
            aria-checked={value === c}
            aria-label={`${ariaLabelPrefix} ${c}`}
            onChange={() => onChange?.(c)}
            className="peer sr-only"
          />
          <div
            className="flex items-center justify-center rounded-full border-2 border-solid border-transparent peer-checked:border-[color:var(--border-input-active)] peer-checked:hover:border-[color:var(--border-input-active-hover)] peer-hover:border-[color:var(--border-input-hover)] peer-focus-visible:border-[color:var(--border-input-active)] peer-focus-visible:hover:border-[color:var(--border-input-active-hover)]"
            style={{ width: px + 8, height: px + 8 }}
          >
            <div className="rounded-full" style={{ width: px, height: px, background: c }} />
          </div>
        </label>
      ))}
    </div>
  );
}

/* ---------- Combobox ---------- */

type ComboCtx = ComboboxProps & {
  list: ReturnType<typeof useListbox<{ key: string }>>;
  pick: (key: string) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  listId: string;
};
const ComboContext = createContext<ComboCtx | null>(null);

/** EDS Combobox: an inline text field that filters a listbox as you type. */
export function Combobox(props: ComboboxProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = `${useId()}-list`;
  const items = useMemo(() => props.options.map((o) => ({ key: o.id })), [props.options]);
  const pick = (key: string) => {
    const option = props.options.find((o) => o.id === key);
    if (!option) return;
    props.onSelectionChange(option);
    list.setOpen(false);
    props.onClose?.();
  };
  const list = useListbox(items, props.selectedOption?.id, (item) => pick(item.key));
  return (
    <ComboContext.Provider value={{ ...props, list, pick, anchorRef, listId }}>
      <Popover
        open={list.open}
        onOpenChange={(o) => {
          if (o) return list.show();
          list.setOpen(false);
          props.onClose?.();
        }}
      >
        {props.children}
      </Popover>
    </ComboContext.Provider>
  );
}

export function ComboboxTextInput({ placeholder, autoFocus, adornmentStart }: ComboboxInputProps) {
  const ctx = useContext(ComboContext)!;
  const field = useShadField();
  const Chevron = ctx.list.open ? DropdownUpIcon : DropdownDownIcon;
  const open = () => !ctx.list.open && ctx.list.show();
  return (
    <PopoverAnchor asChild>
      <div ref={ctx.anchorRef} className={cn(fieldShell, "bg-[color:var(--background-canvas)]")}>
        {adornmentStart && <span className="flex shrink-0 items-center ps-3 lg:ps-2">{adornmentStart}</span>}
        <div className="flex min-w-0 grow flex-col">
          <Input
            id={field?.id}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={ctx.list.open}
            aria-controls={ctx.list.open ? ctx.listId : undefined}
            aria-activedescendant={ctx.list.open && ctx.list.highlighted ? `${ctx.listId}-${ctx.list.highlighted}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={ctx.inputValue ?? ""}
            onChange={(e) => {
              ctx.onInputChange(e.target.value);
              if (!ctx.list.open) ctx.list.show();
            }}
            onFocus={() => ctx.menuTrigger === "focus" && open()}
            onClick={open}
            onKeyDown={ctx.list.onKeyDown}
            className={cn(fieldInput, "pe-2 ps-3 lg:pe-1.5 lg:ps-2")}
          />
          <span className={cn(fieldRing, "border-[color:var(--border-input)] group-hover:border-[color:var(--border-input-hover)]")} />
        </div>
        <div className="inline-flex shrink-0">
          <span>
            <span className="flex items-center text-[14px] leading-[22px] lg:text-[12px] lg:leading-[20px]">
              {"​"}
              <span
                data-testid="combobox-chevron"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (ctx.list.open ? ctx.list.setOpen(false) : ctx.list.show())}
                className="me-3 flex shrink-0 cursor-pointer items-center text-[color:var(--text-tertiary)] lg:me-2"
              >
                <Chevron size="20" aria-hidden className="h-6 w-6 fill-[color:var(--text-secondary)] lg:h-5 lg:w-5" />
              </span>
            </span>
          </span>
        </div>
      </div>
    </PopoverAnchor>
  );
}

export function ComboboxPopover({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function ComboboxListbox({ options, noResultsFallback, children }: ComboboxListboxProps) {
  const ctx = useContext(ComboContext)!;
  return (
    <ListboxPopover
      open={ctx.list.open}
      onOpenChange={(o) => !o && ctx.list.setOpen(false)}
      anchorRef={ctx.anchorRef}
      listRef={ctx.list.listRef}
      listId={ctx.listId}
      matchWidth={ctx.popoverMatchReferenceWidth}
      className="max-h-[356px]"
      footer={options.length === 0 ? <span className="text-[12px] leading-[20px] text-[color:var(--text-secondary)]">{noResultsFallback ?? "No matching results"}</span> : null}
    >
      {options.map((o) => (
        <Fragment key={o.id}>{children(o)}</Fragment>
      ))}
    </ListboxPopover>
  );
}

export function ComboboxItem({ option, children }: ComboboxItemProps) {
  const ctx = useContext(ComboContext)!;
  const isSelected = ctx.selectedOption?.id === option.id;
  return (
    <div
      id={`${ctx.listId}-${option.id}`}
      data-key={option.id}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      data-selected={isSelected || undefined}
      data-highlighted={ctx.list.highlighted === option.id || undefined}
      onPointerMove={() => ctx.list.setHighlighted(option.id)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => ctx.pick(option.id)}
      className={cn(optionClass, "items-start")}
    >
      {/* EDS only adds the tick column once something is chosen. */}
      {ctx.selectedOption && <SelectionIndicator isSelected={isSelected} />}
      <div className="flex min-w-0 grow flex-col">{children}</div>
    </div>
  );
}
