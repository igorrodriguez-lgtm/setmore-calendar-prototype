export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTH_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(date.getDate(), lastDay));
  return d;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -weekdayIndex(date));
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Monday = 0 … Sunday = 6. */
export function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}

/** Local date as YYYY-MM-DD. */
export function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function nowMinutes(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

/** "Wed 21 Oct" */
export function formatDayShort(date: Date) {
  return `${DAY_SHORT[weekdayIndex(date)]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** "19 Oct – 25 Oct" */
export function formatRange(a: Date, b: Date) {
  return `${a.getDate()} ${MONTH_SHORT[a.getMonth()]} - ${b.getDate()} ${MONTH_SHORT[b.getMonth()]}`;
}

/** "Mon 19 Oct 2026" */
export function formatDayLong(date: Date) {
  return `${formatDayShort(date)} ${date.getFullYear()}`;
}

function clock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return { h12: h % 12 === 0 ? 12 : h % 12, m: String(m).padStart(2, "0"), suffix: h < 12 ? "AM" : "PM" };
}

/** Form and popover style: "3:00 PM". */
export function formatTime(minutes: number) {
  const { h12, m, suffix } = clock(minutes);
  return `${h12}:${m} ${suffix}`;
}

/** Grid style without the suffix, e.g. "3:00" (the suffix is drawn smaller next to it). */
export function formatClock(minutes: number) {
  const { h12, m } = clock(minutes);
  return { time: `${h12}:${m}`, suffix: clock(minutes).suffix };
}

/** Hour label parts for the grid gutter: { hour: "2", suffix: "AM" }. */
export function hourLabel(hour: number) {
  return { hour: String(hour % 12 === 0 ? 12 : hour % 12), suffix: hour < 12 ? "AM" : "PM" };
}

/** Which occurrence of its weekday a date is in its month: 1st … 5th. */
export function nthWeekdayOfMonth(date: Date) {
  return Math.floor((date.getDate() - 1) / 7) + 1;
}

export const ORDINALS = ["first", "second", "third", "fourth", "fifth"];

/** Short time-zone name, e.g. "EDT". */
export function timeZoneLabel() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
