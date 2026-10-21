"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CalEvent, Customer, EventKind, Occurrence, PaletteColor, Repeat, View } from "../model/types";
import { ME, classes, customers as seedCustomers, seedEvents, services, staffById } from "../model/mock";
import { addDays, addMonths, startOfWeek, toKey } from "../model/dates";

/** What the appointment form is editing. Times are minutes from midnight. */
export type Draft = {
  editingId?: string;
  tab: EventKind;
  title: string;
  color: PaletteColor;
  serviceId?: string;
  classId?: string;
  date: string;
  start: number;
  end: number;
  repeat: Repeat;
  customerIds: string[];
  video: boolean;
  location: string;
  notes: string;
  staffId: string;
};

export type Anchor = { left: number; top: number; width: number; height: number };

type Composer = { draft: Draft; anchor: Anchor | null };

type Store = {
  now: Date;
  events: CalEvent[];
  customers: Customer[];
  view: View;
  setView: (view: View) => void;
  anchorDate: Date;
  setAnchorDate: (date: Date) => void;
  step: (direction: -1 | 1) => void;
  goToday: () => void;
  hideWeekends: boolean;
  setHideWeekends: (hide: boolean) => void;
  /** Week, Month and Agenda show one person. */
  selectedStaff: string;
  selectStaff: (id: string) => void;
  /** Day and Team show a column per checked person. */
  checkedStaff: string[];
  toggleChecked: (id: string) => void;
  isNavCollapsed: boolean;
  setNavCollapsed: (collapsed: boolean) => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  /** The appointment popover. */
  openOccurrence: { occurrence: Occurrence; anchor: Anchor } | null;
  openPopover: (occurrence: Occurrence, anchor: Anchor) => void;
  closePopover: () => void;
  composer: Composer | null;
  openComposer: (draft: Partial<Draft>, anchor?: Anchor | null) => void;
  updateDraft: (patch: Partial<Draft>) => void;
  closeComposer: () => void;
  saveDraft: () => void;
  moveEvent: (id: string, to: { date: string; start: number; end: number; staffId: string }) => void;
  duplicateEvent: (id: string) => void;
  deleteEvent: (id: string) => void;
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  isAddingCustomer: boolean;
  setAddingCustomer: (open: boolean) => void;
  /** Event waiting for delete confirmation. */
  pendingDelete: string | null;
  setPendingDelete: (id: string | null) => void;
  toast: string | null;
  showToast: (message: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function useCalendar() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useCalendar must be used inside <CalendarProvider>");
  return store;
}

/** The person (or people) whose calendar is on screen. */
export function visibleStaffIds(store: Pick<Store, "view" | "selectedStaff" | "checkedStaff">) {
  return store.view === "day" || store.view === "team" ? store.checkedStaff : [store.selectedStaff];
}

/** Rounds up to the next half hour, as the form's default start. */
function nextHalfHour(now: Date) {
  return Math.min(Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30, 23 * 60 + 30);
}

let createdCount = 0;

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [events, setEvents] = useState<CalEvent[]>(() => seedEvents(new Date()));
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [view, setView] = useState<View>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [hideWeekends, setHideWeekends] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(ME);
  const [checkedStaff, setCheckedStaff] = useState<string[]>([ME]);
  const [isNavCollapsed, setNavCollapsed] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(true);
  const [openOccurrence, setOpenOccurrence] = useState<Store["openOccurrence"]>(null);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAddingCustomer, setAddingCustomer] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // The browser tab is titled after whose calendar is showing, like Setmore.
  useEffect(() => {
    const ids = view === "day" || view === "team" ? checkedStaff : [selectedStaff];
    const first = staffById(ids[0] ?? ME)?.name.split(" ")[0] ?? "Igor";
    document.title = ids.length > 1 ? `${ids.length} calendars` : `${first}'s Calendar`;
  }, [view, selectedStaff, checkedStaff]);

  const step = useCallback(
    (direction: -1 | 1) => {
      setOpenOccurrence(null);
      setAnchorDate((d) =>
        view === "month" ? addMonths(d, direction) : view === "week" || view === "agenda" ? addDays(d, 7 * direction) : addDays(d, direction)
      );
    },
    [view]
  );

  const changeView = useCallback(
    (next: View) => {
      setOpenOccurrence(null);
      // Switching into Day or Team starts from whoever was being looked at.
      if ((next === "day" || next === "team") && view !== "day" && view !== "team") setCheckedStaff([selectedStaff]);
      if ((view === "day" || view === "team") && next !== "day" && next !== "team" && checkedStaff[0]) setSelectedStaff(checkedStaff[0]);
      setView(next);
    },
    [view, selectedStaff, checkedStaff]
  );

  const openComposer = useCallback(
    (patch: Partial<Draft>, anchor: Anchor | null = null) => {
      const start = patch.start ?? nextHalfHour(new Date());
      setOpenOccurrence(null);
      setComposer({
        anchor,
        draft: {
          tab: "service",
          title: "",
          color: "blue",
          date: toKey(new Date()),
          start,
          end: start + 30,
          repeat: { type: "none" },
          customerIds: [],
          video: false,
          location: "",
          notes: "",
          staffId: view === "day" || view === "team" ? checkedStaff[0] ?? ME : selectedStaff,
          ...patch,
        },
      });
    },
    [view, checkedStaff, selectedStaff]
  );

  const saveDraft = useCallback(() => {
    if (!composer) return;
    const d = composer.draft;
    // Service bookings are titled with the guests' names (like Setmore), classes with the class name.
    const guestNames = d.customerIds.map((id) => customers.find((c) => c.id === id)?.name).filter(Boolean).join(" x ");
    const title =
      d.tab === "service"
        ? guestNames || services.find((s) => s.id === d.serviceId)?.name || "Booking"
        : d.tab === "class"
          ? classes.find((c) => c.id === d.classId)?.name ?? "Class"
          : d.title.trim() || "(No title)";
    const base = {
      kind: d.tab,
      title,
      staffId: d.staffId,
      date: d.date,
      start: d.start,
      end: d.end,
      color: d.color,
      serviceId: d.tab === "service" ? d.serviceId : undefined,
      classId: d.tab === "class" ? d.classId : undefined,
      customerIds: d.customerIds,
      video: d.video ? { provider: "google-meet" as const, url: `https://meet.google.com/new-${Date.now().toString(36)}` } : undefined,
      location: d.location || undefined,
      notes: d.notes || undefined,
      repeat: d.repeat,
    };
    if (d.editingId) {
      setEvents((all) => all.map((e) => (e.id === d.editingId ? { ...e, ...base, video: d.video ? e.video ?? base.video : undefined } : e)));
      setToast("Appointment updated");
    } else {
      createdCount++;
      const created: CalEvent = {
        ...base,
        id: `new-${Date.now()}`,
        source: "setmore",
        bookingId: `NRK${String(createdCount).padStart(5, "0")}`,
        bookedFrom: "Web App",
        history: [{ at: toKey(new Date()), time: new Date().getHours() * 60 + new Date().getMinutes(), actor: "Igor", text: `Created ${base.title}` }],
      };
      setEvents((all) => [...all, created]);
      setToast("Appointment created");
    }
    setComposer(null);
  }, [composer, customers]);

  const value: Store = {
    now,
    events,
    customers,
    view,
    setView: changeView,
    anchorDate,
    setAnchorDate: (date) => {
      setOpenOccurrence(null);
      setAnchorDate(date);
    },
    step,
    goToday: () => setAnchorDate(new Date()),
    hideWeekends,
    setHideWeekends,
    selectedStaff,
    selectStaff: (id) => {
      setOpenOccurrence(null);
      setSelectedStaff(id);
    },
    checkedStaff,
    toggleChecked: (id) =>
      setCheckedStaff((ids) => (ids.includes(id) ? (ids.length > 1 ? ids.filter((x) => x !== id) : ids) : [...ids, id])),
    isNavCollapsed,
    setNavCollapsed,
    isPanelOpen,
    setPanelOpen,
    openOccurrence,
    openPopover: (occurrence, anchor) => {
      setComposer(null);
      setOpenOccurrence({ occurrence, anchor });
    },
    closePopover: () => setOpenOccurrence(null),
    composer,
    openComposer,
    updateDraft: (patch) => setComposer((c) => (c ? { ...c, draft: { ...c.draft, ...patch } } : c)),
    closeComposer: () => setComposer(null),
    saveDraft,
    moveEvent: (id, to) => setEvents((all) => all.map((e) => (e.id === id ? { ...e, ...to } : e))),
    duplicateEvent: (id) => {
      setEvents((all) => {
        const original = all.find((e) => e.id === id);
        return original ? [...all, { ...original, id: `copy-${Date.now()}`, repeat: { type: "none" } }] : all;
      });
      setOpenOccurrence(null);
      setToast("Appointment duplicated");
    },
    deleteEvent: (id) => {
      setEvents((all) => all.filter((e) => e.id !== id));
      setOpenOccurrence(null);
      setPendingDelete(null);
      setToast("Appointment deleted");
    },
    addCustomer: (c) => {
      const customer = { ...c, id: `c-new-${Date.now()}` };
      setCustomers((all) => [...all, customer]);
      setToast(`${customer.name} added`);
      return customer;
    },
    isAddingCustomer,
    setAddingCustomer,
    pendingDelete,
    setPendingDelete,
    toast,
    showToast: setToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** The first day shown and the days in the current Week/Day range. */
export function useVisibleDays() {
  const { view, anchorDate, hideWeekends } = useCalendar();
  return useMemo(() => {
    if (view === "day" || view === "team") return [anchorDate];
    const monday = startOfWeek(anchorDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    return hideWeekends ? days.slice(0, 5) : days;
  }, [view, anchorDate, hideWeekends]);
}
