"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarEvent, eventColors, workingHours } from "./data";
import {
  DAY_NAMES,
  addDays,
  formatHour,
  fromKey,
  isSameDay,
  minutesToLabel,
  rangeLabel,
  timeZoneLabel,
  toKey,
  weekdayIndex,
} from "./dates";
import { VideoIcon } from "./icons";

const HOUR_HEIGHT = 58;
const GUTTER = 60;
const SNAP = 15;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Props = {
  days: Date[];
  now: Date;
  events: CalendarEvent[];
  selectedId: string | null;
  onSlotClick: (date: Date, minutes: number) => void;
  onEventClick: (event: CalendarEvent, anchor: DOMRect) => void;
  onEventMove: (id: string, date: string, start: number) => void;
};

type Drag = { id: string; startX: number; startY: number; dayDelta: number; minuteDelta: number; moved: boolean };

export function WeekGrid({ days, now, events, selectedId, onSlotClick, onEventClick, onEventMove }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIndex = days.findIndex((d) => isSameDay(d, now));
  const columns = `${GUTTER}px repeat(${days.length}, minmax(0, 1fr))`;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: HOUR_HEIGHT * 7.6 });
  }, []);

  // Dragging an appointment moves it in 15-minute steps, and across days in week view.
  useEffect(() => {
    if (!drag) return;
    const columnWidth = ((gridRef.current?.clientWidth ?? 0) - GUTTER) / days.length;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const moved = drag.moved || Math.abs(dx) > 4 || Math.abs(dy) > 4;
      setDrag({
        ...drag,
        moved,
        minuteDelta: Math.round(((dy / HOUR_HEIGHT) * 60) / SNAP) * SNAP,
        dayDelta: days.length > 1 && columnWidth > 0 ? Math.round(dx / columnWidth) : 0,
      });
    };
    const onUp = (e: PointerEvent) => {
      const event = events.find((ev) => ev.id === drag.id);
      if (event && drag.moved) {
        const { date, start } = applyDrag(event, drag, days);
        if (date !== event.date || start !== event.start) onEventMove(event.id, date, start);
      } else if (event) {
        const target = (e.target as HTMLElement).closest("[data-event]");
        if (target) onEventClick(event, target.getBoundingClientRect());
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, days, events, onEventClick, onEventMove]);

  const shown = events.map((event) => (drag?.id === event.id && drag.moved ? { ...event, ...applyDrag(event, drag, days) } : event));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Day headings */}
      <div className="grid pr-2" style={{ gridTemplateColumns: columns }}>
        <div />
        {days.map((date, i) => {
          const isToday = i === todayIndex;
          const count = events.filter((e) => e.date === toKey(date)).length;
          return (
            <div key={toKey(date)} className="flex h-14 min-w-0 items-center gap-2 px-3 text-neutral-800 xl:px-5">
              <span
                className={`flex h-10 min-w-10 items-center justify-center rounded-full text-lg font-semibold ${
                  isToday ? "bg-[#3d6b52] text-white" : ""
                }`}
              >
                {date.getDate()}
              </span>
              <span className={`text-lg ${isToday ? "font-semibold" : "text-neutral-600"}`}>
                {DAY_NAMES[weekdayIndex(date)]}
              </span>
              {count > 0 && (
                <span className="ml-auto whitespace-nowrap text-sm text-neutral-500">
                  {count} {count === 1 ? "event" : "events"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable hour grid */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto pr-2">
        <div
          ref={gridRef}
          className={`relative grid ${drag?.moved ? "cursor-grabbing select-none" : ""}`}
          style={{ gridTemplateColumns: columns, height: HOUR_HEIGHT * 24 }}
        >
          {/* Hour labels */}
          <div className="relative">
            <span className="absolute right-2 top-2 text-sm text-neutral-500">+ {timeZoneLabel()}</span>
            {HOURS.slice(1).map((hour) => (
              <span
                key={hour}
                className="absolute right-1.5 -translate-y-1/2 text-[15px] text-neutral-600"
                style={{ top: hour * HOUR_HEIGHT }}
              >
                {formatHour(hour)}
              </span>
            ))}
            {todayIndex >= 0 && (
              <span
                className="absolute right-1 z-20 -translate-y-1/2 rounded-md bg-neutral-900 px-1.5 py-1 text-sm font-semibold text-white"
                style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
              >
                {minutesToLabel(nowMinutes, false)}
              </span>
            )}
          </div>

          {days.map((date, i) => (
            <DayColumn
              key={toKey(date)}
              date={date}
              events={shown.filter((e) => e.date === toKey(date))}
              isToday={i === todayIndex}
              nowMinutes={nowMinutes}
              showNowLine={todayIndex >= 0}
              selectedId={selectedId}
              draggingId={drag?.moved ? drag.id : null}
              onSlotClick={onSlotClick}
              onEventPointerDown={(event, e) =>
                setDrag({ id: event.id, startX: e.clientX, startY: e.clientY, dayDelta: 0, minuteDelta: 0, moved: false })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function applyDrag(event: CalendarEvent, drag: Drag, days: Date[]) {
  const duration = event.end - event.start;
  const start = Math.min(Math.max(event.start + drag.minuteDelta, 0), 24 * 60 - duration);
  const dayIndex = days.findIndex((d) => toKey(d) === event.date);
  const target = dayIndex >= 0 ? days[Math.min(Math.max(dayIndex + drag.dayDelta, 0), days.length - 1)] : fromKey(event.date);
  return { date: toKey(target), start, end: start + duration };
}

function DayColumn({
  date,
  events,
  isToday,
  nowMinutes,
  showNowLine,
  selectedId,
  draggingId,
  onSlotClick,
  onEventPointerDown,
}: {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  nowMinutes: number;
  showNowLine: boolean;
  selectedId: string | null;
  draggingId: string | null;
  onSlotClick: (date: Date, minutes: number) => void;
  onEventPointerDown: (event: CalendarEvent, e: React.PointerEvent) => void;
}) {
  const isWorkingDay = workingHours.days.includes(weekdayIndex(date));
  const nowTop = (nowMinutes / 60) * HOUR_HEIGHT;

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const minutes = Math.floor(((y / HOUR_HEIGHT) * 60) / 30) * 30;
    onSlotClick(addDays(date, 0), minutes);
  };

  return (
    <div className="relative border-l border-neutral-200" onClick={handleSlotClick}>
      {HOURS.map((hour) => {
        const working = isWorkingDay && hour * 60 >= workingHours.start && hour * 60 < workingHours.end;
        return (
          <div
            key={hour}
            className={`border-b border-neutral-200 hover:bg-blue-50/40 ${working ? "bg-white" : "bg-neutral-100"}`}
            style={{ height: HOUR_HEIGHT }}
          />
        );
      })}

      {layoutEvents(events).map(({ event, column, columns }) => (
        <EventBlock
          key={event.id}
          event={event}
          column={column}
          columns={columns}
          selected={event.id === selectedId}
          dragging={event.id === draggingId}
          onPointerDown={(e) => onEventPointerDown(event, e)}
        />
      ))}

      {showNowLine && (
        <div
          className={`pointer-events-none absolute inset-x-0 z-10 ${isToday ? "h-0.5 bg-neutral-900" : "h-px bg-neutral-300"}`}
          style={{ top: nowTop }}
        >
          {isToday && <span className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-neutral-900" />}
        </div>
      )}
    </div>
  );
}

function EventBlock({
  event,
  column,
  columns,
  selected,
  dragging,
  onPointerDown,
}: {
  event: CalendarEvent;
  column: number;
  columns: number;
  selected: boolean;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const top = (event.start / 60) * HOUR_HEIGHT;
  const height = Math.max(((event.end - event.start) / 60) * HOUR_HEIGHT - 2, 16);
  const width = 100 / columns;
  const color = eventColors[event.color];
  const roomForTime = height >= 40;
  const time = rangeLabel(event.start, event.end);

  return (
    <div
      data-event
      role="button"
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onPointerDown(e);
      }}
      className={`absolute cursor-pointer overflow-hidden rounded-lg border-l-[3px] px-3 text-left leading-tight transition-shadow hover:z-10 hover:shadow-md ${color.block} ${color.bar} ${color.text} ${
        selected ? "z-10 ring-2 ring-neutral-900" : ""
      } ${dragging ? "z-30 opacity-90 shadow-lg" : ""}`}
      style={{ top: top + 1, height, left: `calc(${column * width}% + 4px)`, width: `calc(${width}% - 8px)` }}
      title={`${event.title} · ${time}`}
    >
      <div className={`flex items-center gap-2 ${roomForTime ? "pt-2" : "h-full"}`}>
        <span className="max-w-full flex-none truncate text-[17px] font-semibold">{event.title}</span>
        {!roomForTime && <span className="min-w-0 truncate text-sm opacity-80">{time}</span>}
        {event.video && <VideoIcon className="ml-auto h-4 w-4 shrink-0 opacity-70" />}
      </div>
      {roomForTime && <div className="mt-0.5 truncate text-sm opacity-80">{time}</div>}
    </div>
  );
}

/** Splits overlapping events into side-by-side columns. */
function layoutEvents(events: CalendarEvent[]) {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: { event: CalendarEvent; column: number; columns: number }[] = [];
  let cluster: typeof placed = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    cluster.forEach((p) => (p.columns = columnEnds.length));
    placed.push(...cluster);
    cluster = [];
    columnEnds = [];
  };

  for (const event of sorted) {
    if (event.start >= clusterEnd) closeCluster();
    let column = columnEnds.findIndex((end) => end <= event.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = event.end;
    cluster.push({ event, column, columns: 1 });
    clusterEnd = Math.max(clusterEnd, event.end);
  }
  closeCluster();
  return placed;
}
