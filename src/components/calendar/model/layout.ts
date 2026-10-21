import { Occurrence } from "./types";

export type Placed = {
  occurrence: Occurrence;
  /** Fractions of the column width, 0–1. */
  left: number;
  width: number;
  /** Later, indented appointments sit on top. */
  layer: number;
};

/** How far a later-starting overlapping appointment is indented into the one beneath it. */
const INDENT = 0.45;

/**
 * Lays out one day column the way Setmore does:
 * appointments that start at the same time share the width side by side, and one that starts
 * while another is still running is indented over it and drawn on top.
 */
export function layoutDay(occurrences: Occurrence[]): Placed[] {
  const sorted = [...occurrences].sort((a, b) => a.start - b.start || b.end - a.end);
  const groups: Occurrence[][] = [];
  for (const o of sorted) {
    const last = groups[groups.length - 1];
    if (last && last[0].start === o.start) last.push(o);
    else groups.push([o]);
  }

  type Span = { left: number; right: number; end: number; layer: number };
  const placed: Placed[] = [];
  const spans: Span[] = [];

  for (const group of groups) {
    const start = group[0].start;
    for (let i = spans.length - 1; i >= 0; i--) if (spans[i].end <= start) spans.splice(i, 1);

    // Take the lowest free layer. Layer 0 is the full column; deeper layers indent into the
    // still-running appointment one layer down, so a slot freed underneath is reused at full width.
    const busy = new Set(spans.map((s) => s.layer));
    let layer = 0;
    while (busy.has(layer)) layer++;
    const parent = layer > 0 ? [...spans].reverse().find((s) => s.layer === layer - 1) : undefined;
    const left = parent ? parent.left + (parent.right - parent.left) * INDENT : 0;
    const right = parent ? parent.right : 1;

    const width = (right - left) / group.length;
    group.forEach((occurrence, i) => {
      const l = left + i * width;
      placed.push({ occurrence, left: l, width, layer });
      spans.push({ left: l, right: l + width, end: occurrence.end, layer });
    });
  }
  return placed;
}
