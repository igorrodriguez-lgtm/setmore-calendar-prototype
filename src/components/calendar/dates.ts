export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Local date as YYYY-MM-DD. */
export function toKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Monday = 0 … Sunday = 6. */
export function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function formatHour(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${suffix}`;
}

export function minutesToLabel(minutes: number, withSuffix = true) {
  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, "0");
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return withSuffix ? `${h12}:${mins}${hours < 12 ? "AM" : "PM"}` : `${h12}:${mins}`;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "3 – 4PM", "7:30 – 8:30PM", "11:30AM – 12PM" */
export function rangeLabel(start: number, end: number) {
  const part = (m: number) => {
    const hours = Math.floor(m / 60) % 24;
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return m % 60 ? `${h12}:${String(m % 60).padStart(2, "0")}` : `${h12}`;
  };
  const suffix = (m: number) => (Math.floor(m / 60) % 24 < 12 ? "AM" : "PM");
  const sameHalf = suffix(start) === suffix(end);
  return `${part(start)}${sameHalf ? "" : suffix(start)} – ${part(end)}${suffix(end)}`;
}

/** Short time zone name for the grid corner, e.g. "EDT" or "IST". */
export function timeZoneLabel() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
