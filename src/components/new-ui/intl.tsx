// Date and time helpers for New mode. Everything goes through Intl.DateTimeFormat — no hard-coded
// patterns. The design's AM / PM style (no space before AM / PM, and AM / PM ~2px smaller) is
// applied via `formatToParts`, so 24-hour locales render untouched.
import type { ReactNode } from "react";

/** Default: the browser's locale. The spec says 12-hour / 24-hour is a region choice, so we don't force it. */
export const LOCALE = typeof navigator === "undefined" ? "en-US" : navigator.language || "en-US";
export const TZ = "America/New_York"; // The board is in Eastern Time (EDT).

/** @minute minutes from midnight, @onDate the day the time belongs to. */
export function timeOn(onDate: Date, minute: number) {
  const d = new Date(onDate);
  d.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
  return d;
}

/** { "9:34 AM" } → [{t:"9:34",fs:"1em"},{t:"AM",fs:"0.86em"}], 24-hour locales pass through. */
export function timeParts(d: Date): { t: string; small?: boolean }[] {
  const parts = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "numeric" }).formatToParts(d);
  const out: { t: string; small?: boolean }[] = [];
  let buffer = "";
  for (const p of parts) {
    if (p.type === "dayPeriod") {
      if (buffer) out.push({ t: buffer });
      buffer = "";
      out.push({ t: p.value.toUpperCase(), small: true });
    } else if (p.type === "literal" && p.value === " " && parts.find((x) => x.type === "dayPeriod")) {
      // drop the space before AM / PM only
      continue;
    } else {
      buffer += p.value;
    }
  }
  if (buffer) out.push({ t: buffer });
  return out;
}

/** Short time like "9AM" (omits ":00") used by hour labels and card captions. */
export function hourLabel(d: Date): { t: string; small?: boolean }[] {
  const parts = timeParts(d);
  return parts.map((p) => (p.small ? p : { t: p.t.replace(":00", "") }));
}

/** React-friendly rendering: wraps the smaller parts in <small>. */
export function renderTime(d: Date, opts: { hourOnly?: boolean } = {}): ReactNode {
  const parts = opts.hourOnly ? hourLabel(d) : timeParts(d);
  return parts.map((p, i) =>
    p.small ? (
      <small key={i} className="text-[0.86em] font-inherit">
        {p.t}
      </small>
    ) : (
      <span key={i}>{p.t}</span>
    )
  );
}

/** "9AM – 10AM", "9AM · Jillian", "9 – 10:30AM" — collapses the AM / PM when start and end share one. */
export function renderRange(start: Date, end: Date): ReactNode {
  const sa = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", hour12: true }).formatToParts(start).find((p) => p.type === "dayPeriod")?.value?.toUpperCase();
  const sb = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", hour12: true }).formatToParts(end).find((p) => p.type === "dayPeriod")?.value?.toUpperCase();
  if (!sa) {
    // 24-hour locale: render both ends in full.
    return (
      <>
        {renderTime(start, { hourOnly: true })} – {renderTime(end, { hourOnly: true })}
      </>
    );
  }
  if (sa === sb) {
    // Drop the leading AM / PM: "9 – 10AM".
    const left = timeParts(start)
      .filter((p) => !p.small)
      .map((p) => p.t)
      .join("");
    return (
      <>
        {left.replace(":00", "")} – {renderTime(end, { hourOnly: true })}
      </>
    );
  }
  return (
    <>
      {renderTime(start, { hourOnly: true })} – {renderTime(end, { hourOnly: true })}
    </>
  );
}

/** "Sep – Oct 2026" for the toolbar title. Takes the Monday and Sunday of the visible range. */
export function formatRangeTitle(from: Date, to: Date): string {
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const yearF = from.getFullYear() === to.getFullYear() ? "" : ` ${from.getFullYear()}`;
  const fMonth = new Intl.DateTimeFormat(LOCALE, { month: "short" }).format(from);
  const tMonth = new Intl.DateTimeFormat(LOCALE, { month: "short" }).format(to);
  if (sameMonth) return `${fMonth}${yearF} ${to.getFullYear()}`;
  return `${fMonth}${yearF} – ${tMonth} ${to.getFullYear()}`;
}

/** Day header: "28 Mon", "2 Fri" with the number and short weekday. */
export function formatDayHead(d: Date): { num: string; day: string } {
  return {
    num: new Intl.DateTimeFormat(LOCALE, { day: "numeric" }).format(d),
    day: new Intl.DateTimeFormat(LOCALE, { weekday: "short" }).format(d),
  };
}
