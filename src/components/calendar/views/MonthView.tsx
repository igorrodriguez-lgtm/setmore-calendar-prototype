"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useKit } from "../../kit";
import { useCalendar, type Anchor } from "../state/store";
import { ME } from "../model/mock";
import { expand } from "../model/recurrence";
import { Occurrence } from "../model/types";
import { DAY_SHORT, MONTHS, addDays, formatClock, isSameDay, startOfMonth, startOfWeek, toKey, weekdayIndex } from "../model/dates";
import { Dot } from "../booking/AppointmentForm";

const ROW = 20;
const HEADER = 26;

function rectOf(el: Element): Anchor {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function MonthView() {
  const store = useCalendar();
  const { anchorDate, now, events, selectedStaff, hideWeekends } = store;
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(120);
  const [more, setMore] = useState<{ date: Date; anchor: Anchor } | null>(null);

  const first = startOfMonth(anchorDate);
  const gridStart = startOfWeek(first);
  const lastOfMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const weeks = Math.ceil((weekdayIndex(first) + lastOfMonth.getDate()) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i)).filter((d) => !hideWeekends || weekdayIndex(d) < 5);
  const columns = hideWeekends ? 5 : 7;

  const byDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of expand(events.filter((e) => e.staffId === selectedStaff), gridStart, addDays(gridStart, weeks * 7 - 1))) {
      map.set(o.date, [...(map.get(o.date) ?? []), o]);
    }
    return map;
  }, [events, selectedStaff, gridStart.getTime(), weeks]); // eslint-disable-line react-hooks/exhaustive-deps

  // How many one-line rows fit depends on the cell height (taller screens show more).
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setCellHeight(el.clientHeight / weeks);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [weeks]);
  const fits = Math.max(1, Math.floor((cellHeight - HEADER - 4) / ROW));

  return (
    <div className="isolate flex min-h-0 flex-1 flex-col border-t border-tertiary">
      <div className="grid shrink-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {DAY_SHORT.filter((_, i) => !hideWeekends || i < 5).map((d, i) => (
          <div key={d} className={`py-1 text-center fs-11 ${i > 4 ? "bg-calendar-disabled text-tertiary" : "text-secondary"}`}>
            {d}
          </div>
        ))}
      </div>
      <div ref={gridRef} className="grid min-h-0 flex-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}>
        {days.map((date) => {
          const list = byDay.get(toKey(date)) ?? [];
          const inMonth = date.getMonth() === first.getMonth();
          const isWeekend = weekdayIndex(date) > 4;
          const isToday = isSameDay(date, now);
          const shown = list.length > fits ? list.slice(0, fits - 1) : list;
          const hidden = list.length - shown.length;
          const label = date.getDate() === 1 ? `1 ${MONTHS[date.getMonth()]}` : String(date.getDate());
          return (
            <div
              key={toKey(date)}
              className={`relative flex min-h-0 flex-col overflow-hidden border-l border-t border-tertiary px-1 pb-1 ${isWeekend ? "bg-calendar-disabled" : "bg-calendar"}`}
              onClick={(e) => {
                if ((e.target as Element).closest("button")) return;
                store.openComposer({ tab: "event", date: toKey(date), start: 9 * 60, end: 10 * 60, staffId: selectedStaff }, rectOf(e.currentTarget));
              }}
            >
              <div className="flex h-[26px] shrink-0 items-center px-1">
                <button
                  type="button"
                  onClick={() => {
                    store.setAnchorDate(date);
                    store.setView("day");
                  }}
                  aria-label={`Go to ${date.toDateString()}`}
                  className={`fs-11 focus-visible:focus-ring ${
                    isToday
                      ? "flex h-[18px] min-w-[18px] items-center justify-center rounded-4px bg-inverse px-1 font-stronger text-onPrimary"
                      : inMonth && !isWeekend
                        ? "text-primary hover:underline"
                        : "text-tertiary hover:underline"
                  }`}
                >
                  {label}
                </button>
              </div>
              {shown.map((o) => (
                <MonthRow key={o.key} occurrence={o} isSelected={store.openOccurrence?.occurrence.key === o.key} onOpen={(el) => store.openPopover(o, rectOf(el))} />
              ))}
              {hidden > 0 && (
                <button
                  type="button"
                  className="mt-0.5 self-start rounded-4px px-1 fs-11 text-secondary hover:bg-neutral-hover focus-visible:focus-ring"
                  onClick={(e) => setMore({ date, anchor: rectOf(e.currentTarget.parentElement!) })}
                >
                  {hidden} more
                </button>
              )}
            </div>
          );
        })}
      </div>

      <MorePopover state={more} occurrences={more ? byDay.get(toKey(more.date)) ?? [] : []} onClose={() => setMore(null)} />
    </div>
  );
}

function MonthRow({ occurrence, isSelected, onOpen }: { occurrence: Occurrence; isSelected: boolean; onOpen: (el: Element) => void }) {
  const { icons } = useKit();
  const { event, start } = occurrence;
  const isBusy = Boolean(event.isPrivate) && event.staffId !== ME;
  const { time, suffix } = formatClock(start);
  return (
    <button
      type="button"
      onClick={(e) => (isBusy ? undefined : onOpen(e.currentTarget))}
      className={`flex h-[20px] w-full min-w-0 shrink-0 items-center gap-1.5 rounded-4px px-1 text-left fs-11 focus-visible:focus-ring ${isSelected ? "bg-neutral-pressed" : "hover:bg-neutral-hover"}`}
    >
      {isBusy ? <icons.lock size="16" aria-hidden className="h-[10px] w-[10px] shrink-0 text-secondary" /> : <Dot color={event.color} size={8} />}
      <span className="shrink-0 text-secondary">
        {event.allDay ? (
          "All day"
        ) : (
          <>
            {time}
            <span className="fs-8">{suffix}</span>
          </>
        )}
      </span>
      <span className="min-w-0 truncate text-primary">{isBusy ? "Busy" : event.title}</span>
      {event.video && !isBusy && <icons.video size="16" aria-hidden className="h-[11px] w-[11px] shrink-0" />}
    </button>
  );
}

/** "Wed 30" overflow list for a busy day. */
function MorePopover({ state, occurrences, onClose }: { state: { date: Date; anchor: Anchor } | null; occurrences: Occurrence[]; onClose: () => void }) {
  const { AnchoredPopover, IconButton, icons } = useKit();
  const store = useCalendar();
  return (
    <AnchoredPopover anchor={state?.anchor ?? null} onClose={onClose} ariaLabel={state ? `All appointments on ${state.date.toDateString()}` : "Appointments"} placement="bottom-start" width={220}>
      {state && (
        <div className="p-2 pt-1.5">
          <div className="mb-1 flex items-center justify-between pl-1">
            <h2 className="text-body-14 font-stronger">
              {DAY_SHORT[weekdayIndex(state.date)]} {state.date.getDate()}
            </h2>
            <IconButton aria-label="Close" icon={icons.close} variant="neutralTertiary" size="small" onClick={onClose} />
          </div>
          {occurrences.map((o) => (
            <MonthRow
              key={o.key}
              occurrence={o}
              isSelected={false}
              onOpen={(el) => {
                onClose();
                store.openPopover(o, rectOf(el));
              }}
            />
          ))}
        </div>
      )}
    </AnchoredPopover>
  );
}
