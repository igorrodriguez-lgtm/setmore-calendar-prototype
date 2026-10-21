"use client";

import { CalendarEvent, eventColors } from "./data";
import { DAY_NAMES, addDays, isSameDay, minutesToLabel, startOfMonth, startOfWeek, toKey } from "./dates";

const MAX_PER_DAY = 3;

type Props = {
  month: Date;
  now: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent, anchor: DOMRect) => void;
};

export function MonthGrid({ month, now, events, onDayClick, onEventClick }: Props) {
  const first = startOfWeek(startOfMonth(month));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {DAY_NAMES.map((d) => (
          <span key={d} className="px-3 py-2 text-sm text-neutral-500">
            {d}
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {cells.map((date) => {
          const dayEvents = events.filter((e) => e.date === toKey(date)).sort((a, b) => a.start - b.start);
          const inMonth = date.getMonth() === month.getMonth();
          const isToday = isSameDay(date, now);
          return (
            <div
              key={toKey(date)}
              onClick={() => onDayClick(date)}
              className={`flex min-h-0 cursor-pointer flex-col gap-0.5 overflow-hidden border-b border-l border-neutral-200 p-1.5 hover:bg-neutral-50 ${inMonth ? "" : "bg-neutral-50/60"}`}
            >
              <span
                className={`mb-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  isToday ? "bg-[#3d6b52] font-semibold text-white" : inMonth ? "text-neutral-800" : "text-neutral-400"
                }`}
              >
                {date.getDate()}
              </span>
              {dayEvents.slice(0, MAX_PER_DAY).map((event) => {
                const color = eventColors[event.color];
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event, e.currentTarget.getBoundingClientRect());
                    }}
                    className={`flex items-center gap-1.5 truncate rounded px-1.5 py-0.5 text-left text-xs ${color.block} ${color.text}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />
                    <span className="shrink-0 opacity-75">{minutesToLabel(event.start)}</span>
                    <span className="truncate font-medium">{event.title}</span>
                  </button>
                );
              })}
              {dayEvents.length > MAX_PER_DAY && (
                <span className="px-1.5 text-xs text-neutral-500">+{dayEvents.length - MAX_PER_DAY} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
