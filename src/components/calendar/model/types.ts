/** EDS palette names (see --palette-<name>-* in src/styles/eds-tokens.css). */
export type PaletteColor =
  | "blue"
  | "red"
  | "orange"
  | "yellow"
  | "violet"
  | "dark-blue"
  | "maroon"
  | "gray"
  | "dark-green"
  | "green";

/** Weekly working hours, Monday = 0. Minutes from midnight; null = day off. */
export type WorkingHours = ({ start: number; end: number } | null)[];

export type Staff = {
  id: string;
  name: string;
  workingHours: WorkingHours;
};

export type Service = { id: string; name: string; duration: number; color: PaletteColor; price: number };
export type ClassType = { id: string; name: string; seats: number; duration: number; color: PaletteColor };
export type Customer = { id: string; name: string; email: string; phone: string };

export type Repeat =
  | { type: "none" }
  | { type: "daily"; until?: string }
  | { type: "weekdays"; until?: string }
  | { type: "weekly"; until?: string }
  | { type: "monthly"; until?: string }
  | { type: "annually"; until?: string }
  | { type: "custom"; every: number; unit: "day" | "week" | "month"; until?: string };

export type HistoryEntry = { at: string; time: number; actor?: string; text: string };

export type EventKind = "service" | "class" | "event";

export type CalEvent = {
  id: string;
  kind: EventKind;
  /** Event name, class name, or (for service bookings) the customer's name. */
  title: string;
  staffId: string;
  /** First occurrence, YYYY-MM-DD. */
  date: string;
  /** Minutes from midnight. */
  start: number;
  end: number;
  allDay?: boolean;
  color: PaletteColor;
  serviceId?: string;
  classId?: string;
  customerIds?: string[];
  video?: { provider: "google-meet"; url: string };
  location?: string;
  notes?: string;
  repeat: Repeat;
  source: "setmore" | "google";
  /** Someone else's private calendar item: shown as a hatched "Busy" block. */
  isPrivate?: boolean;
  bookingId: string;
  bookedFrom: string;
  history: HistoryEntry[];
};

/** One drawn instance of an event (a recurring event has many). */
export type Occurrence = {
  key: string;
  event: CalEvent;
  date: string;
  start: number;
  end: number;
};

export type View = "day" | "week" | "month" | "agenda" | "team";
