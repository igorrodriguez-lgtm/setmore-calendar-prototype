// Mock data for the prototype. Names are placeholders, not real customers or staff.
import { addDays, startOfWeek, toKey } from "./dates";

export type CalendarSource = "setmore" | "google";

export type EventColor = "blue" | "teal" | "green" | "red" | "orange";

/** Tailwind classes per appointment colour. Replaced by EDS tokens once eds-core is installed. */
export const eventColors: Record<EventColor, { block: string; bar: string; text: string; dot: string }> = {
  green: { block: "bg-[#e8efe9]", bar: "border-[#3d6b52]", text: "text-[#1f3d2c]", dot: "bg-[#3d6b52]" },
  red: { block: "bg-[#fbecea]", bar: "border-[#b4432f]", text: "text-[#6e2115]", dot: "bg-[#b4432f]" },
  orange: { block: "bg-[#fdf0e6]", bar: "border-[#e08a4a]", text: "text-[#6b3510]", dot: "bg-[#e08a4a]" },
  blue: { block: "bg-[#e6efff]", bar: "border-[#6f9ef0]", text: "text-neutral-900", dot: "bg-[#6f9ef0]" },
  teal: { block: "bg-[#e3eaec]", bar: "border-[#2f5f6b]", text: "text-neutral-900", dot: "bg-[#2f5f6b]" },
};

export type CalendarEvent = {
  id: string;
  title: string;
  /** Local date as YYYY-MM-DD. */
  date: string;
  /** Minutes from midnight. */
  start: number;
  end: number;
  source: CalendarSource;
  color: EventColor;
  video?: boolean;
  customer?: string;
  staffId?: string;
  notes?: string;
};

export type TeamMember = {
  id: string;
  name: string;
};

export const currentUser = { id: "me", name: "Igor Rodriguez", email: "igor.rodriguez@anywhere.co" };

export const team: TeamMember[] = [
  "Alex Morgan",
  "Priya Shah",
  "Sam Carter",
  "Dana Lee",
  "Chris Ortiz",
  "Maya Patel",
  "Leo Kim",
  "Nina Brooks",
  "Omar Haddad",
  "Ruth Allen",
  "Tom Becker",
  "Zoe Nguyen",
  "Ben Foster",
  "Ivy Chen",
  "Raj Iyer",
  "Ella Ward",
].map((name, i) => ({ id: `t${i}`, name }));

export const services = [
  { id: "s1", name: "Consultation", duration: 30 },
  { id: "s2", name: "Product demo", duration: 60 },
  { id: "s3", name: "Follow-up", duration: 15 },
  { id: "s4", name: "Onboarding", duration: 45 },
];

/** Working hours shown on a white background; everything else is shaded. Days: 0 = Monday. */
export const workingHours = { start: 8 * 60, end: 17 * 60, days: [0, 1, 2, 3, 4] };

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

/** Seeds the calendar with appointments in the current week, like the reference screenshot. */
export function seedEvents(today: Date): CalendarEvent[] {
  const monday = startOfWeek(today);
  const on = (day: number) => toKey(addDays(monday, day));
  const seed: Omit<CalendarEvent, "id">[] = [
    { title: "Jordan Hale for Igor", date: on(0), start: h(9), end: h(9, 30), source: "google", color: "blue", staffId: "me" },
    { title: "Igor - Weekly sync", date: on(0), start: h(9, 15), end: h(9, 45), source: "google", color: "blue", staffId: "me" },
    { title: "Igor - Meet Jordan", date: on(0), start: h(9, 30), end: h(10), source: "google", color: "blue", staffId: "me" },
    { title: "Igor Rodriguez 1:1", date: on(0), start: h(10), end: h(10, 30), source: "google", color: "blue", video: true, staffId: "me" },
    { title: "Igor - Review", date: on(0), start: h(10, 15), end: h(10, 45), source: "google", color: "blue", video: true, staffId: "me" },
    { title: "Igor Rodriguez", date: on(0), start: h(10, 30), end: h(11), source: "google", color: "blue", staffId: "me" },
    { title: "Marketing check-in", date: on(0), start: h(10, 30), end: h(11), source: "setmore", color: "blue", video: true, customer: "Maya Patel", staffId: "me" },
    { title: "Catch up", date: on(0), start: h(11, 30), end: h(12), source: "setmore", color: "blue", video: true, customer: "Leo Kim", staffId: "me" },
    { title: "Learning Around Infrastructure", date: on(0), start: h(14), end: h(14, 15), source: "setmore", color: "blue", video: true, staffId: "me" },
    { title: "LUCY - Product review", date: on(1), start: h(10), end: h(11), source: "setmore", color: "teal", video: true, customer: "Lucy Grant", staffId: "me" },
    { title: "Design System", date: on(2), start: h(8, 15), end: h(9), source: "setmore", color: "blue", video: true, staffId: "me" },
    { title: "Igor - Meet Jordan", date: on(4), start: h(10), end: h(10, 30), source: "setmore", color: "blue", customer: "Jordan Hale", staffId: "me" },
    { title: "Consultation", date: on(1), start: h(13), end: h(13, 30), source: "setmore", color: "blue", customer: "Sam Carter", staffId: "t2" },
    { title: "Product demo", date: on(3), start: h(15), end: h(16), source: "setmore", color: "teal", video: true, customer: "Ivy Chen", staffId: "t2" },
    { title: "Follow-up", date: on(2), start: h(11), end: h(11, 15), source: "setmore", color: "blue", customer: "Nina Brooks", staffId: "t5" },
    { title: "Onboarding", date: on(4), start: h(14), end: h(14, 45), source: "setmore", color: "blue", customer: "Ben Foster", staffId: "t5" },
    { title: "Onboarding", date: on(7), start: h(9), end: h(9, 45), source: "setmore", color: "blue", customer: "Ben Foster", staffId: "me" },
    { title: "Follow-up", date: on(9), start: h(11), end: h(11, 15), source: "setmore", color: "blue", customer: "Nina Brooks", staffId: "me" },
  ];
  return seed.map((e, i) => ({ ...e, id: `e${i}` }));
}
