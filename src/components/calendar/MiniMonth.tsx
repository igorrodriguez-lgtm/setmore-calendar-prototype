"use client";

import { useState } from "react";
import { DAY_NAMES, MONTHS, addDays, addMonths, isSameDay, startOfMonth, startOfWeek } from "./dates";
import { ChevronLeft, ChevronRight } from "./icons";

/** Small month calendar for jumping to a date. Kit-independent so either kit can use it. */
export function MiniMonth({ selected, today, onPick }: { selected: Date; today: Date; onPick: (date: Date) => void }) {
  const [month, setMonth] = useState(startOfMonth(selected));
  const first = startOfWeek(month);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const navButton = "flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100";

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="pl-1 font-semibold">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <span className="flex">
          <button type="button" aria-label="Previous month" className={navButton} onClick={() => setMonth(addMonths(month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next month" className={navButton} onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-neutral-500">
        {DAY_NAMES.map((d) => (
          <span key={d} className="py-1">
            {d[0]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map((date) => {
          const inMonth = date.getMonth() === month.getMonth();
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onPick(date)}
              className={`m-0.5 flex h-8 items-center justify-center rounded-full ${
                isSelected
                  ? "bg-neutral-900 font-semibold text-white"
                  : isToday
                    ? "font-semibold underline underline-offset-4"
                    : inMonth
                      ? "hover:bg-neutral-100"
                      : "text-neutral-400 hover:bg-neutral-100"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
