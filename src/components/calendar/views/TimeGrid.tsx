"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useCalendar, useVisibleDays, visibleStaffIds, type Anchor } from "../state/store";
import { ME, services, staffById } from "../model/mock";
import { expand } from "../model/recurrence";
import { layoutDay } from "../model/layout";
import { Occurrence } from "../model/types";
import { DAY_SHORT, addDays, daysBetween, formatClock, fromKey, hourLabel, isSameDay, nowMinutes, timeZoneLabel, toKey, weekdayIndex } from "../model/dates";
import { StaffAvatar } from "../shell/StaffAvatar";
import { useKit } from "../../kit";
import { GoogleG } from "../shell/GoogleG";

/** Setmore's hour height (measured on live at 100% zoom). */
const HOUR = 44;
const GUTTER = 64;
/** Space above midnight, so the 12AM label isn't cut off. */
const TOP = 12;
const SNAP = 15;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Column = { key: string; date: Date; staffId: string };

type Drag = {
  key: string;
  mode: "move" | "resize";
  x: number;
  y: number;
  column: number;
  deltaMin: number;
  deltaCol: number;
  moved: boolean;
};

function rectOf(el: Element): Anchor {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function TimeGrid() {
  const store = useCalendar();
  const { now, events, view, composer, openOccurrence } = store;
  const days = useVisibleDays();
  const staffIds = visibleStaffIds(store);
  const scrollRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const columns: Column[] = useMemo(
    () => days.flatMap((date) => staffIds.map((staffId) => ({ key: `${toKey(date)}:${staffId}`, date, staffId }))),
    [days, staffIds]
  );
  const multiStaff = staffIds.length > 1;

  const occurrences = useMemo(
    () => expand(events.filter((e) => staffIds.includes(e.staffId) && !e.allDay), days[0], days[days.length - 1]),
    [events, staffIds, days]
  );

  // Open scrolled like live: the line two hours before the working day sits just below the top.
  useEffect(() => {
    const hours = staffById(staffIds[0] ?? ME)?.workingHours.find(Boolean);
    const first = hours ? hours.start / 60 - 2 : 6;
    scrollRef.current?.scrollTo({ top: Math.max(0, TOP + first * HOUR - 17) });
    // Only when whose calendar is shown changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffIds.join(",")]);

  // Dragging: move in 15-minute steps (and across columns), or resize from the bottom edge.
  useEffect(() => {
    if (!drag) return;
    const colWidth = (colsRef.current?.clientWidth ?? 1) / columns.length;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      setDrag({
        ...drag,
        moved: drag.moved || Math.abs(dx) > 3 || Math.abs(dy) > 3,
        deltaMin: Math.round(((dy / HOUR) * 60) / SNAP) * SNAP,
        deltaCol: drag.mode === "move" ? Math.round(dx / colWidth) : 0,
      });
    };
    const onUp = (e: PointerEvent) => {
      const o = occurrences.find((x) => x.key === drag.key);
      if (o && drag.moved) {
        const next = applyDrag(o, drag, columns);
        const shift = daysBetween(fromKey(o.date), fromKey(next.date));
        store.moveEvent(o.event.id, {
          date: toKey(addDays(fromKey(o.event.date), shift)),
          start: next.start,
          end: next.end,
          staffId: next.staffId,
        });
      } else if (o) {
        const el = (e.target as Element).closest("[data-occurrence]");
        if (el) store.openPopover(o, rectOf(el));
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, occurrences, columns, store]);

  const shown = occurrences.map((o) => (drag?.moved && drag.key === o.key ? { ...o, ...applyDrag(o, drag, columns) } : { ...o, staffId: o.event.staffId }));
  const todayIndex = days.findIndex((d) => isSameDay(d, now));
  const nowTop = (nowMinutes(now) / 60) * HOUR;
  const ghost = composer && !composer.draft.editingId ? composer.draft : null;
  const gridTemplate = `repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    // `isolate` keeps the grid's internal z-indexes (now line, dragged blocks) below modals and popovers.
    <div className="isolate flex min-h-0 flex-1 flex-col">
      {/* Column headings: day names in Week, people when several are shown. */}
      {(view === "week" || multiStaff) && (
        <div className="flex shrink-0 pr-[6px]" style={{ paddingLeft: GUTTER }}>
          <div className="grid flex-1" style={{ gridTemplateColumns: gridTemplate }}>
            {columns.map((c) =>
              multiStaff ? (
                <div key={c.key} className="flex h-[30px] min-w-0 items-center gap-2 px-2 fs-11 text-primary">
                  <StaffAvatar id={c.staffId} size={22} />
                  <span className="truncate">{staffById(c.staffId)?.name}</span>
                </div>
              ) : (
                <DayHeading key={c.key} date={c.date} isToday={isSameDay(c.date, now)} />
              )
            )}
          </div>
        </div>
      )}
      {/* Time zone and the all-day strip above the hours, as on live. */}
      <div className="flex h-[33px] shrink-0 pr-[6px]">
        <div className="flex shrink-0 items-center justify-end border-b border-calendar pr-[8px] fs-9 font-strong uppercase text-tertiary" style={{ width: GUTTER }}>
          {timeZoneLabel()}
        </div>
        <div className="grid flex-1" style={{ gridTemplateColumns: gridTemplate }}>
          {columns.map((c) => (
            <div key={c.key} className="border-l border-tertiary" />
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="eds-scroll relative min-h-0 flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: HOUR * 24 + TOP }}>
          {/* Hour labels */}
          <div className="relative shrink-0" style={{ width: GUTTER }}>
            {HOURS.slice(1).map((hour) => {
              const { hour: label, suffix } = hourLabel(hour);
              return (
                <span key={hour} className="absolute right-[8px] fs-10 leading-[12px] text-tertiary" style={{ top: TOP + hour * HOUR - 2 }}>
                  {label}
                  <span className="fs-8">{suffix}</span>
                </span>
              );
            })}
            {todayIndex >= 0 && (
              <span
                className="absolute right-[2px] z-30 -translate-y-1/2 rounded-4px bg-inverse px-[4px] py-[1px] fs-11 font-stronger text-onPrimary"
                style={{ top: TOP + nowTop }}
              >
                {formatClock(nowMinutes(now)).time}
              </span>
            )}
          </div>

          <div ref={colsRef} className={`relative grid flex-1 ${drag?.moved ? "cursor-grabbing select-none" : ""}`} style={{ gridTemplateColumns: gridTemplate, marginTop: TOP }}>
            {columns.map((c, ci) => {
              const colOccurrences = shown.filter((o) => o.date === toKey(c.date) && o.staffId === c.staffId);
              const isToday = isSameDay(c.date, now);
              return (
                <DayColumn
                  key={c.key}
                  column={c}
                  occurrences={colOccurrences}
                  isToday={isToday}
                  showNow={todayIndex >= 0}
                  nowTop={nowTop}
                  draggingKey={drag?.moved ? drag.key : null}
                  selectedKey={openOccurrence?.occurrence.key ?? null}
                  ghost={ghost && ghost.date === toKey(c.date) && ghost.staffId === c.staffId ? ghost : null}
                  onSlot={(minutes, el) => {
                    const start = Math.floor(minutes / 30) * 30;
                    store.openComposer({ tab: "event", date: toKey(c.date), start, end: Math.min(start + 60, 24 * 60), staffId: c.staffId }, rectOf(el));
                  }}
                  onOpen={store.openPopover}
                  onGrab={(o, mode, e) =>
                    setDrag({ key: o.key, mode, x: e.clientX, y: e.clientY, column: ci, deltaMin: 0, deltaCol: 0, moved: false })
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function applyDrag(o: Occurrence, drag: Drag, columns: Column[]) {
  const target = columns[Math.min(Math.max(drag.column + drag.deltaCol, 0), columns.length - 1)];
  if (drag.mode === "resize") {
    const end = Math.min(Math.max(o.end + drag.deltaMin, o.start + SNAP), 24 * 60);
    return { date: o.date, start: o.start, end, staffId: o.event.staffId };
  }
  const length = o.end - o.start;
  const start = Math.min(Math.max(o.start + drag.deltaMin, 0), 24 * 60 - length);
  return { date: toKey(target.date), start, end: start + length, staffId: target.staffId };
}

function DayHeading({ date, isToday }: { date: Date; isToday: boolean }) {
  const isWeekend = weekdayIndex(date) > 4;
  return (
    <div className={`flex h-[22px] items-center justify-center gap-[7px] fs-12 ${isWeekend ? "text-tertiary" : "text-primary"}`}>
      <span
        className={
          isToday
            ? "flex h-5 min-w-5 items-center justify-center rounded-4px bg-inverse px-[3px] font-stronger text-onPrimary"
            : ""
        }
      >
        {date.getDate()}
      </span>
      <span className={isToday ? "font-stronger" : ""}>{DAY_SHORT[weekdayIndex(date)]}</span>
    </div>
  );
}

type ColumnProps = {
  column: Column;
  occurrences: (Occurrence & { staffId: string })[];
  isToday: boolean;
  showNow: boolean;
  nowTop: number;
  draggingKey: string | null;
  selectedKey: string | null;
  ghost: { title: string; start: number; end: number; color: string; tab: string } | null;
  onSlot: (minutes: number, el: Element) => void;
  onGrab: (o: Occurrence, mode: "move" | "resize", e: React.PointerEvent) => void;
  onOpen: (o: Occurrence, anchor: Anchor) => void;
};

function DayColumn({ column, occurrences, isToday, showNow, nowTop, draggingKey, selectedKey, ghost, onSlot, onGrab, onOpen }: ColumnProps) {
  const hours = staffById(column.staffId)?.workingHours[weekdayIndex(column.date)] ?? null;
  const ghostRef = useRef<HTMLDivElement>(null);

  // Off-hours shading: grey outside the person's working hours, white inside.
  const working = hours ? { top: (hours.start / 60) * HOUR, height: ((hours.end - hours.start) / 60) * HOUR } : null;

  return (
    <div
      className="relative border-l border-tertiary bg-calendar-disabled"
      onClick={(e) => {
        if ((e.target as Element).closest("[data-occurrence]")) return;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
        onSlot((y / HOUR) * 60, e.currentTarget);
      }}
    >
      {working && <div className="absolute inset-x-0 bg-calendar" style={working} />}
      {HOURS.map((hour) => (
        <div key={hour} className="pointer-events-none absolute inset-x-0 border-t border-calendar" style={{ top: hour * HOUR }} />
      ))}

      {layoutDay(occurrences).map(({ occurrence, left, width, layer }) => (
        <EventBlock
          key={occurrence.key}
          occurrence={occurrence}
          style={{
            top: (occurrence.start / 60) * HOUR + 1,
            height: Math.max(((occurrence.end - occurrence.start) / 60) * HOUR - 2, 9),
            left: `calc(${left * 100}% + 2px)`,
            width: `calc(${width * 100}% - 5px)`,
            zIndex: occurrence.key === draggingKey ? 25 : 1 + layer,
          }}
          isSelected={occurrence.key === selectedKey}
          isDragging={occurrence.key === draggingKey}
          isOwnerView={column.staffId === ME || !occurrence.event.isPrivate}
          onGrab={onGrab}
          onOpen={onOpen}
        />
      ))}

      {ghost && (
        <div
          ref={ghostRef}
          className="pointer-events-none absolute left-[2px] right-[3px] z-20 overflow-hidden rounded-4px px-[5px] py-[2px] fs-11 leading-tight text-onPrimary"
          style={{
            top: (ghost.start / 60) * HOUR + 1,
            height: Math.max(((ghost.end - ghost.start) / 60) * HOUR - 2, 12),
            background: ghost.tab === "event" ? `var(--palette-${ghost.color}-background-active)` : "var(--background-inverse)",
          }}
        >
          {ghost.tab === "event" && <div className="truncate font-stronger">{ghost.title || "Event name"}</div>}
          <div className="truncate fs-10">
            <Clock minutes={ghost.start} />
            {ghost.tab === "event" && (
              <>
                {" - "}
                <Clock minutes={ghost.end} />
              </>
            )}
          </div>
        </div>
      )}

      {showNow && (
        <div
          className={`pointer-events-none absolute inset-x-0 z-[15] ${isToday ? "h-[2px] bg-inverse" : "h-px bg-inverse-tertiary"}`}
          style={{ top: nowTop - (isToday ? 1 : 0) }}
        >
          {isToday && <span className="absolute -top-[4px] left-0 h-[10px] w-[2px] bg-inverse" />}
        </div>
      )}
    </div>
  );
}

function Clock({ minutes }: { minutes: number }) {
  const { time, suffix } = formatClock(minutes);
  return (
    <>
      {time}
      <span className="fs-10">{suffix}</span>
    </>
  );
}

function EventBlock({
  occurrence,
  style,
  isSelected,
  isDragging,
  isOwnerView,
  onGrab,
  onOpen,
}: {
  occurrence: Occurrence;
  style: CSSProperties;
  isSelected: boolean;
  isDragging: boolean;
  isOwnerView: boolean;
  onGrab: (o: Occurrence, mode: "move" | "resize", e: React.PointerEvent) => void;
  onOpen: (o: Occurrence, anchor: Anchor) => void;
}) {
  const { icons } = useKit();
  const LockIcon = icons.lock;
  const VideoIcon = icons.video;
  const { event, start, end } = occurrence;
  const short = end - start < 60;
  const isBusy = !isOwnerView;
  const isGoogle = event.source === "google" && !isBusy;
  const c = event.color;
  const palette = {
    "--ev-bg": isSelected ? `var(--palette-${c}-background-active)` : `var(--palette-${c}-background)`,
    "--ev-bg-hover": isSelected ? `var(--palette-${c}-background-active)` : `var(--palette-${c}-background-hover)`,
    "--ev-bar": `var(--palette-${c}-border)`,
  } as CSSProperties;

  const subtitle = event.kind === "service" ? services.find((s) => s.id === event.serviceId)?.name : <Clock minutes={start} />;

  if (isBusy) {
    return (
      <div
        data-occurrence
        className="eds-hatch absolute overflow-hidden rounded-4px border border-secondary px-[5px] fs-12 leading-4 text-secondary"
        style={style}
        title="Busy"
      >
        <div className={`flex items-center gap-[3px] ${short ? "h-full" : "pt-[3px]"}`}>
          <LockIcon size="16" className="h-[12px] w-[12px] shrink-0" aria-hidden />
          <span>Busy</span>
          {short && (
            <span className="truncate">
              <Clock minutes={start} />
            </span>
          )}
        </div>
        {!short && (
          <div className="truncate">
            <Clock minutes={start} /> - <Clock minutes={end} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-occurrence
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${formatClock(start).time}${formatClock(start).suffix}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const box = e.currentTarget.getBoundingClientRect();
        onGrab(occurrence, box.bottom - e.clientY < 5 ? "resize" : "move", e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(occurrence, rectOf(e.currentTarget));
        }
      }}
      className={`group absolute cursor-pointer overflow-hidden rounded-4px fs-12 leading-4 ${
        isGoogle
          ? "border border-secondary bg-canvas hover:bg-neutral-hover"
          : "border-l-[3px] border-[color:var(--ev-bar)] bg-[var(--ev-bg)] hover:bg-[var(--ev-bg-hover)]"
      } ${isSelected ? "text-onPrimary" : "text-primary"} ${isDragging ? "opacity-90 shadow-20" : ""}`}
      style={{ ...style, ...palette }}
    >
      <div className={`flex min-w-0 items-center gap-[4px] pl-[5px] ${isGoogle ? "pr-[24px]" : "pr-[5px]"} ${short ? "h-full" : "pt-[3px]"}`}>
        <span className="min-w-0 shrink truncate font-strong">{event.title}</span>
        {event.video && <VideoIcon size="16" className="h-[14px] w-[14px] shrink-0" aria-hidden />}
        {short && <span className={`ml-[2px] min-w-0 shrink-[3] truncate ${isSelected ? "" : "text-secondary"}`}>{subtitle}</span>}
      </div>
      {!short && (
        <div className={`truncate px-[5px] ${isSelected ? "" : "text-secondary"}`}>
          <Clock minutes={start} /> - <Clock minutes={end} />
        </div>
      )}
      {isGoogle && <GoogleG className={`absolute right-[6px] h-[14px] w-[14px] ${short ? "top-1/2 -translate-y-1/2" : "top-[4px]"}`} />}
      <span className="absolute inset-x-0 bottom-0 h-[5px] cursor-ns-resize" aria-hidden />
    </div>
  );
}

