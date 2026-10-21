import { CalEvent, Occurrence, Repeat } from "./types";
import {
  DAY_LONG,
  MONTHS,
  ORDINALS,
  addDays,
  daysBetween,
  formatDayLong,
  fromKey,
  nthWeekdayOfMonth,
  toKey,
  weekdayIndex,
} from "./dates";

/** The choices in the form's repeat dropdown, worded from the chosen date like Setmore does. */
export function repeatOptions(date: Date): { value: Repeat["type"]; label: string }[] {
  return [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekdays", label: "Every working day only" },
    { value: "weekly", label: `Weekly on ${DAY_LONG[weekdayIndex(date)]}` },
    { value: "monthly", label: `Monthly on ${ORDINALS[nthWeekdayOfMonth(date) - 1]} ${DAY_LONG[weekdayIndex(date)]}` },
    { value: "annually", label: `Annually on ${date.getDate()} ${MONTHS[date.getMonth()]}` },
    { value: "custom", label: "Custom" },
  ];
}

/** "Every weekday until Sun 15 Oct 2028", shown under the time in the appointment popover. */
export function describeRepeat(repeat: Repeat, date: Date) {
  const until = repeat.type !== "none" && repeat.until ? ` until ${formatDayLong(fromKey(repeat.until))}` : "";
  switch (repeat.type) {
    case "none":
      return null;
    case "daily":
      return `Every day${until}`;
    case "weekdays":
      return `Every weekday${until}`;
    case "weekly":
      return `Weekly on ${DAY_LONG[weekdayIndex(date)]}${until}`;
    case "monthly":
      return `Monthly on the ${ORDINALS[nthWeekdayOfMonth(date) - 1]} ${DAY_LONG[weekdayIndex(date)]}${until}`;
    case "annually":
      return `Annually on ${date.getDate()} ${MONTHS[date.getMonth()]}${until}`;
    case "custom":
      return `Every ${repeat.every} ${repeat.unit}${repeat.every === 1 ? "" : "s"}${until}`;
  }
}

function occursOn(event: CalEvent, day: Date) {
  const first = fromKey(event.date);
  const offset = daysBetween(first, day);
  if (offset < 0) return false;
  const r = event.repeat;
  if (r.type !== "none" && r.until && toKey(day) > r.until) return false;
  switch (r.type) {
    case "none":
      return offset === 0;
    case "daily":
      return true;
    case "weekdays":
      return weekdayIndex(day) < 5;
    case "weekly":
      return offset % 7 === 0;
    case "monthly":
      return weekdayIndex(day) === weekdayIndex(first) && nthWeekdayOfMonth(day) === nthWeekdayOfMonth(first);
    case "annually":
      return day.getMonth() === first.getMonth() && day.getDate() === first.getDate();
    case "custom": {
      if (r.unit === "day") return offset % r.every === 0;
      if (r.unit === "week") return offset % (7 * r.every) === 0;
      const months = (day.getFullYear() - first.getFullYear()) * 12 + day.getMonth() - first.getMonth();
      return months % r.every === 0 && day.getDate() === first.getDate();
    }
  }
}

/** Every occurrence of `events` from `from` up to and including `to`, sorted by date and time. */
export function expand(events: CalEvent[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  const days = daysBetween(from, to);
  for (const event of events) {
    for (let i = 0; i <= days; i++) {
      const day = addDays(from, i);
      if (!occursOn(event, day)) continue;
      const date = toKey(day);
      out.push({ key: `${event.id}@${date}`, event, date, start: event.start, end: event.end });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.event.allDay ? -1 : 0) - (b.event.allDay ? -1 : 0) || a.start - b.start);
}
