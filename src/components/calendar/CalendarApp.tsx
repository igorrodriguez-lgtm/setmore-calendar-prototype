"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KitProvider, KitToggle, useKit } from "../kit";
import { AppNav } from "./AppNav";
import { AppointmentForm, Draft } from "./AppointmentForm";
import { CalendarHeader, View } from "./CalendarHeader";
import { EventDetails } from "./EventDetails";
import { MonthGrid } from "./MonthGrid";
import { WeekGrid } from "./WeekGrid";
import { CalendarEvent, CalendarSource, currentUser, seedEvents } from "./data";
import { addDays, addMonths, startOfMonth, startOfWeek, toKey } from "./dates";

export function CalendarApp() {
  // Dates and time zones differ between server and browser, so render only in the browser.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <KitProvider>
      <Calendar />
      <KitToggle />
    </KitProvider>
  );
}

function Calendar() {
  const { AnchoredPopover } = useKit();
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => seedEvents(new Date()));
  const [visibleSources, setVisibleSources] = useState<Set<CalendarSource>>(new Set(["setmore", "google"]));
  const [visibleStaff, setVisibleStaff] = useState<Set<string>>(new Set([currentUser.id]));
  const [selected, setSelected] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const shown = useMemo(
    () => events.filter((e) => visibleSources.has(e.source) && visibleStaff.has(e.staffId ?? currentUser.id)),
    [events, visibleSources, visibleStaff]
  );
  const selectedEvent = selected ? events.find((e) => e.id === selected.id) ?? null : null;
  const days = view === "day" ? [anchor] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));

  const step = useCallback(
    (direction: -1 | 1) => {
      setSelected(null);
      setAnchor((a) => (view === "month" ? addMonths(a, direction) : addDays(a, direction * (view === "week" ? 7 : 1))));
    },
    [view]
  );

  const openNew = useCallback((date = new Date(), start?: number) => {
    const now = new Date();
    const begin = start ?? Math.min(Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30, 23 * 60);
    setSelected(null);
    setDraft({ title: "Consultation", date: toKey(date), start: begin, end: begin + 30, color: "green", staffId: currentUser.id });
  }, []);

  const shareBookingLink = useCallback(() => {
    const link = "https://booking.setmore.com/igor-rodriguez";
    navigator.clipboard?.writeText(link).catch(() => {});
    setToast("Booking page link copied");
  }, []);

  // Keyboard shortcuts, ignored while typing in a field or when a dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (draft || e.metaKey || e.ctrlKey || e.altKey || target.closest("input, textarea, select, [role=dialog]")) return;
      const key = e.key.toLowerCase();
      if (key === "t") setAnchor(new Date());
      else if (key === "d") setView("day");
      else if (key === "w") setView("week");
      else if (key === "m") setView("month");
      else if (key === "n") openNew(anchor);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anchor, draft, openNew, step]);

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const save = (d: Draft) => {
    if (d.id) {
      setEvents((all) => all.map((e) => (e.id === d.id ? { ...e, ...d, id: e.id } : e)));
      setToast("Appointment updated");
    } else {
      const id = `new-${Date.now()}`;
      setEvents((all) => [...all, { ...d, id, source: "setmore" }]);
      if (d.staffId && !visibleStaff.has(d.staffId)) setVisibleStaff(toggle(visibleStaff, d.staffId));
      setToast("Appointment booked");
    }
    setDraft(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AppNav
        isCollapsed={isNavCollapsed}
        onToggle={() => setIsNavCollapsed((c) => !c)}
        isClockedIn={isClockedIn}
        onClockToggle={() => {
          setIsClockedIn((c) => !c);
          setToast(isClockedIn ? "Clocked out" : "Clocked in");
        }}
        onShareBookingLink={shareBookingLink}
        onNotBuilt={(feature) => setToast(`${feature} isn't part of this prototype`)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          view={view}
          anchor={anchor}
          now={now}
          visibleSources={visibleSources}
          visibleStaff={visibleStaff}
          onToday={() => setAnchor(new Date())}
          onStep={step}
          onPickDate={(date) => setAnchor(date)}
          onViewChange={setView}
          onToggleSource={(s) => setVisibleSources(toggle(visibleSources, s))}
          onToggleStaff={(id) => setVisibleStaff(toggle(visibleStaff, id))}
          onNew={() => openNew(anchor)}
          onShareBookingLink={shareBookingLink}
        />

        {view === "month" ? (
          <MonthGrid
            month={startOfMonth(anchor)}
            now={now}
            events={shown}
            onDayClick={(date) => {
              setAnchor(date);
              setView("day");
            }}
            onEventClick={(event, rect) => setSelected({ id: event.id, rect })}
          />
        ) : (
          <WeekGrid
            days={days}
            now={now}
            events={shown}
            selectedId={selected?.id ?? null}
            onSlotClick={(date, minutes) => (selected ? setSelected(null) : openNew(date, minutes))}
            onEventClick={(event, rect) => setSelected({ id: event.id, rect })}
            onEventMove={(id, date, start) => {
              setEvents((all) => all.map((e) => (e.id === id ? { ...e, date, start, end: start + (e.end - e.start) } : e)));
              setToast("Appointment moved");
            }}
          />
        )}
      </main>

      <AnchoredPopover anchor={selectedEvent ? selected!.rect : null} onClose={() => setSelected(null)}>
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onJoin={() => setToast("Opening video meeting…")}
            onEdit={() => {
              const { source: _source, ...rest } = selectedEvent;
              setSelected(null);
              setDraft(rest);
            }}
            onDelete={() => {
              setEvents((all) => all.filter((e) => e.id !== selectedEvent.id));
              setSelected(null);
              setToast("Appointment deleted");
            }}
          />
        )}
      </AnchoredPopover>

      <AppointmentForm draft={draft} onClose={() => setDraft(null)} onSave={save} />

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
