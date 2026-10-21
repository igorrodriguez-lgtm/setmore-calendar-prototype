// Mock data for the prototype. Names are placeholders, not real customers or staff.
import { addDays, startOfWeek, toKey } from "./dates";

export type CalendarSource = "setmore" | "google";

export type EventColor = "green" | "red" | "orange" | "blue";

/** Tailwind classes per appointment colour. Replaced by EDS tokens once eds-core is installed. */
export const eventColors: Record<EventColor, { block: string; bar: string; text: string; dot: string }> = {
  green: { block: "bg-[#e8efe9]", bar: "border-[#3d6b52]", text: "text-[#1f3d2c]", dot: "bg-[#3d6b52]" },
  red: { block: "bg-[#fbecea]", bar: "border-[#b4432f]", text: "text-[#6e2115]", dot: "bg-[#b4432f]" },
  orange: { block: "bg-[#fdf0e6]", bar: "border-[#e08a4a]", text: "text-[#6b3510]", dot: "bg-[#e08a4a]" },
  blue: { block: "bg-[#e9f0fb]", bar: "border-[#4a7fd1]", text: "text-[#1d3a66]", dot: "bg-[#4a7fd1]" },
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
export const workingHours = { start: 13 * 60 + 30, end: 24 * 60, days: [0, 1, 2, 3, 4] };

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

/** Seeds the calendar with appointments in the current week, like the reference screenshot. */
export function seedEvents(today: Date): CalendarEvent[] {
  const monday = startOfWeek(today);
  const on = (day: number) => toKey(addDays(monday, day));
  const seed: Omit<CalendarEvent, "id">[] = [];
  for (let day = 0; day < 5; day++) {
    seed.push({ title: "For Calls", date: on(day), start: h(15), end: h(16), source: "setmore", color: "green", staffId: "me" });
    seed.push({ title: "For Tasks", date: on(day), start: h(19, 30), end: h(20, 30), source: "setmore", color: "green", staffId: "me" });
  }
  seed.push(
    { title: "Alex Morgan", date: on(0), start: h(13, 30), end: h(14), source: "setmore", color: "red", video: true, customer: "Alex Morgan", staffId: "me" },
    { title: "Priya Shah x Sam Carter", date: on(1), start: h(14, 30), end: h(15), source: "setmore", color: "green", staffId: "t2" },
    { title: "Dana Lee", date: on(1), start: h(17, 30), end: h(18), source: "setmore", color: "orange", customer: "Dana Lee", staffId: "me" },
    { title: "IT Interview", date: on(2), start: h(17), end: h(17, 30), source: "setmore", color: "green", video: true, staffId: "me" },
    { title: "People & Culture sync", date: on(2), start: h(17), end: h(17, 30), source: "google", color: "green", staffId: "me" },
    { title: "Process Trainer - Interview", date: on(2), start: h(21, 30), end: h(22, 30), source: "setmore", color: "green", video: true, customer: "Chris Ortiz", staffId: "me" },
    { title: "CSM recruitment Discussion", date: on(3), start: h(14, 30), end: h(15), source: "google", color: "green", staffId: "me" },
    { title: "Product demo", date: on(3), start: h(10), end: h(11), source: "setmore", color: "blue", video: true, customer: "Ivy Chen", staffId: "t13" },
    { title: "Onboarding", date: on(7), start: h(9), end: h(9, 45), source: "setmore", color: "green", customer: "Ben Foster", staffId: "me" },
    { title: "Follow-up", date: on(9), start: h(11), end: h(11, 15), source: "setmore", color: "orange", customer: "Nina Brooks", staffId: "me" },
  );
  return seed.map((e, i) => ({ ...e, id: `e${i}` }));
}
