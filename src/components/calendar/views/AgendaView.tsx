"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useKit } from "../../kit";
import { useCalendar, type Anchor } from "../state/store";
import { ME, staffById } from "../model/mock";
import { expand } from "../model/recurrence";
import { DAY_SHORT, MONTH_SHORT, addMonths, formatTime, fromKey, isSameDay, startOfWeek, weekdayIndex } from "../model/dates";
import { Dot } from "../booking/AppointmentForm";
import { GoogleG } from "../shell/GoogleG";
import { StaffAvatar } from "../shell/StaffAvatar";

/** Months of appointments added each time the list nears its end. */
const CHUNK_MONTHS = 3;
/** Matches the header range (about a year and a half ahead). */
const MAX_MONTHS = 17;

export function AgendaView() {
  const { icons } = useKit();
  const store = useCalendar();
  const { anchorDate, now, events, selectedStaff } = store;
  const [months, setMonths] = useState(CHUNK_MONTHS);
  const endRef = useRef<HTMLDivElement>(null);
  const from = startOfWeek(anchorDate);

  useEffect(() => setMonths(CHUNK_MONTHS), [anchorDate, selectedStaff]);

  const rows = useMemo(
    () => expand(events.filter((e) => e.staffId === selectedStaff), from, addMonths(from, months)),
    [events, selectedStaff, from.getTime(), months] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Load more rows as the end of the list scrolls into view.
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setMonths((m) => Math.min(m + CHUNK_MONTHS, MAX_MONTHS));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rows.length]);

  return (
    <div className="eds-scroll min-h-0 flex-1 overflow-y-auto pl-3 pr-4">
      <ul aria-label="Agenda" className="mx-auto">
        {rows.map((o, i) => {
          const date = fromKey(o.date);
          const prev = i > 0 ? fromKey(rows[i - 1].date) : from;
          const newYear = date.getFullYear() !== prev.getFullYear();
          const isToday = isSameDay(date, now);
          const isBusy = Boolean(o.event.isPrivate) && o.event.staffId !== ME;
          return (
            <Fragment key={o.key}>
              {newYear && (
                <li aria-hidden className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-tertiary" />
                  <span className="fs-11 font-stronger text-primary">{date.getFullYear()}</span>
                  <span className="h-px flex-1 bg-tertiary" />
                </li>
              )}
              <li>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const anchor: Anchor = { left: r.left + 220, top: r.top, width: 200, height: r.height };
                    store.openPopover(o, anchor);
                  }}
                  className="grid h-[44px] w-full grid-cols-[96px_130px_minmax(0,1fr)_auto] items-center gap-4 border-b border-tertiary px-1 text-left fs-11 hover:bg-neutral-hover focus-visible:focus-ring"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-4px px-0.5 ${isToday ? "bg-inverse font-stronger text-onPrimary" : "text-primary"}`}
                    >
                      {date.getDate()}
                    </span>
                    <span className={isToday ? "font-stronger" : "text-secondary"}>
                      {MONTH_SHORT[date.getMonth()]}, {DAY_SHORT[weekdayIndex(date)]}
                    </span>
                  </span>
                  <span className="text-right text-secondary">{o.event.allDay ? "All day" : `${formatTime(o.start)} – ${formatTime(o.end)}`}</span>
                  <span className="flex min-w-0 items-center gap-2">
                    {o.event.allDay && o.event.source === "google" ? <GoogleG className="h-3 w-3 shrink-0" /> : <Dot color={isBusy ? "gray" : o.event.color} size={10} />}
                    <span className="truncate text-primary">{isBusy ? "Busy" : o.event.title}</span>
                    {o.event.video && !isBusy && <icons.video size="16" aria-hidden className="h-[12px] w-[12px] shrink-0" />}
                  </span>
                  <span className="flex items-center gap-2 pr-2">
                    <StaffAvatar id={o.event.staffId} size={20} />
                    <span className="max-w-[160px] truncate">{staffById(o.event.staffId)?.name}</span>
                  </span>
                </button>
              </li>
            </Fragment>
          );
        })}
        {rows.length === 0 && <li className="py-16 text-center text-body-14 text-secondary">No upcoming appointments</li>}
      </ul>
      {months < MAX_MONTHS && <div ref={endRef} className="h-8" />}
    </div>
  );
}
