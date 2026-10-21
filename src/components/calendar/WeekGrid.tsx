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
import { GoogleIcon, VideoIcon } from "./icons";

const HOUR_HEIGHT = 58;
const GUTTER = 84;
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
    scrollRef.current?.scrollTo({ top: HOUR_HEIGHT * 5.6 });
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
          const isWeekend = !workingHours.days.includes(weekdayIndex(date));
          return (
            <div
              key={toKey(date)}
              className={`flex h-10 min-w-0 items-center justify-center gap-1.5 text-base ${isWeekend ? "text-neutral-400" : "text-neutral-800"}`}
            >
              <span className={isToday ? "rounded-md bg-neutral-900 px-1 font-semibold text-white" : ""}>{date.getDate()}</span>
              <span className={isToday ? "font-semibold" : ""}>{DAY_NAMES[weekdayIndex(date)]}</span>
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
            <span className="absolute right-2 top-3 text-[11px] text-neutral-500">{timeZoneLabel()}</span>
            {HOURS.slice(1).map((hour) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-neutral-500"
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
          className={`pointer-events-none absolute inset-x-0 z-10 ${isToday ? "h-0.5 bg-neutral-900" : "h-px bg-neutral-400"}`}
          style={{ top: nowTop }}
        >
          {isToday && <span className="absolute -left-px -top-1.5 h-3.5 w-0.5 bg-neutral-900" />}
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
  // Overlapping appointments stagger like Setmore: each one shifts right and sits on top of the last.
  const indent = columns > 1 ? Math.min(45, 70 / (columns - 1)) : 0;
  const left = column * indent;
  const color = eventColors[event.color];
  const isGoogle = event.source === "google";
  const roomForTime = height >= 40;
  const time = `${minutesToLabel(event.start)} - ${minutesToLabel(event.end)}`;

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
      className={`absolute cursor-pointer overflow-hidden rounded-md px-2 text-left text-[15px] leading-tight text-neutral-900 transition-shadow hover:shadow-md ${
        isGoogle ? "border border-neutral-300 bg-white" : color.block
      } ${selected ? "ring-2 ring-neutral-900" : ""} ${dragging ? "opacity-90 shadow-lg" : ""}`}
      style={{ top: top + 1, height, left: `calc(${left}% + 3px)`, width: `calc(${100 - left}% - 6px)`, zIndex: selected || dragging ? 30 : column + 1 }}
      title={`${event.title} · ${time}`}
    >
      <div className={`flex items-center gap-1.5 ${roomForTime ? "pt-1.5" : "h-full"}`}>
        <span className="min-w-0 truncate font-medium">{event.title}</span>
        {event.video && <VideoIcon className="h-4 w-4 shrink-0" />}
        {!roomForTime && !isGoogle && <span className="min-w-0 shrink-[3] truncate text-sm text-neutral-500">{minutesToLabel(event.start, false)}</span>}
        {isGoogle && <GoogleIcon className="ml-auto h-4 w-4 shrink-0" />}
      </div>
      {roomForTime && <div className="mt-0.5 truncate text-sm text-neutral-600">{time}</div>}
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
