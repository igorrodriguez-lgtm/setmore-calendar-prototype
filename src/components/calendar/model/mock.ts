// Made-up data for the prototype. No real customers, staff, emails or phone numbers.
import { CalEvent, ClassType, Customer, PaletteColor, Repeat, Service, Staff, WorkingHours } from "./types";
import { addDays, startOfMonth, startOfWeek, toKey, weekdayIndex } from "./dates";

export const ME = "igor";

const h = (hours: number, minutes = 0) => hours * 60 + minutes;
const weekdays = (start: number, end: number): WorkingHours => [...[0, 1, 2, 3, 4].map(() => ({ start, end })), null, null];

const staffNames: [string, WorkingHours][] = [
  ["Maya Okafor", weekdays(h(9), h(18))],
  ["Theo Lindqvist", weekdays(h(4), h(13))],
  ["Priya Raman", weekdays(h(8), h(17))],
  ["Northwind Studio.", [null, null, null, null, null, null, null]],
  ["Sofia Marchetti", weekdays(h(7, 30), h(17, 30))],
  ["A2B-Support", weekdays(h(9), h(17))],
  ["Marcus Bell", weekdays(h(10), h(19))],
  ["Hana Sato", weekdays(h(8), h(16))],
  ["Diego Alvarez", weekdays(h(9), h(17))],
  ["Ines Duarte", weekdays(h(6), h(14))],
  ["Kwame Mensah", weekdays(h(9), h(17))],
  ["Lena Fischer", weekdays(h(8), h(17))],
  ["Omar Haddad", weekdays(h(12), h(20))],
  ["Ruth Abernathy", weekdays(h(9), h(15))],
  ["Arjun Mehta", weekdays(h(5), h(14))],
  ["Clara Novak", weekdays(h(9), h(17))],
  ["Felix Wagner", weekdays(h(8), h(16))],
  ["Grace Liu", weekdays(h(9), h(18))],
  ["Studio Demo Account", weekdays(h(9), h(17))],
  ["Jonah Pike", weekdays(h(10), h(18))],
  ["Amara Nwosu", weekdays(h(7), h(15))],
  ["Benedikt Roth", weekdays(h(9), h(17))],
  ["Chloe Martin", weekdays(h(8), h(16))],
  ["Dev Patel", weekdays(h(4), h(12))],
  ["Elena Petrova", weekdays(h(9), h(17))],
  ["Farah Siddiqui", weekdays(h(9), h(17))],
  ["Gabriel Costa", weekdays(h(11), h(19))],
  ["Helena Berg", weekdays(h(8), h(16))],
  ["Isaac Moreau", weekdays(h(9), h(17))],
  ["Juniper Hayes", weekdays(h(9), h(17))],
  ["Kenji Watanabe", weekdays(h(6), h(15))],
  ["Lucia Romano", weekdays(h(9), h(17))],
  ["Mateo Silva", weekdays(h(10), h(18))],
  ["Nadia Karim", weekdays(h(8), h(17))],
];

export const staff: Staff[] = [
  { id: ME, name: "Igor Rodriguez", workingHours: weekdays(h(8), h(17)) },
  ...staffNames.map(([name, workingHours], i) => ({ id: `s${i + 1}`, name, workingHours })),
];

export const staffById = (id: string) => staff.find((s) => s.id === id);

export const services: Service[] = [
  { id: "svc-30", name: "30 mins meeting", duration: 30, color: "red", price: 0 },
  { id: "svc-30b", name: "30 minute meeting", duration: 30, color: "orange", price: 0 },
  { id: "svc-consult", name: "Consultation", duration: 45, color: "dark-blue", price: 25 },
  { id: "svc-demo", name: "Product walkthrough", duration: 60, color: "dark-green", price: 40 },
];

export const classes: ClassType[] = [
  { id: "cls-webinar", name: "Spring Leadership Webinar with guest speakers", seats: 200, duration: 60, color: "violet" },
  { id: "cls-bugbash", name: "Bug Bash - Mobile app", seats: 50, duration: 45, color: "dark-blue" },
  { id: "cls-camp", name: "Leadership - Virtual Camp for new managers", seats: 5, duration: 120, color: "green" },
  { id: "cls-meetup", name: "Virtual Community Meetup for partners", seats: 20, duration: 120, color: "green" },
];

const customerNames = [
  "Jordan Hale", "Avery Quinn", "Riley Brooks", "Casey Morgan", "Taylor Reed", "Morgan Ellis", "Jamie Fox",
  "Drew Carter", "Sam Whitfield", "Alex Rivera", "Robin Shaw", "Quinn Harper", "Parker Lane", "Rowan Blake",
  "Skyler Grant", "Emerson Cole", "Finley Ward", "Hayden Price", "Kendall Ross", "Logan Pierce",
];

export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  phone: `+1 555 01${String(i).padStart(2, "0")}`,
}));

/** Deterministic pseudo-random numbers, so the mock month looks the same every load. */
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

let nextId = 1;
const bookingId = () => `BK${String(4000 + nextId).padStart(5, "0")}`;

type Seed = Omit<CalEvent, "id" | "bookingId" | "bookedFrom" | "history" | "repeat" | "source"> &
  Partial<Pick<CalEvent, "repeat" | "source" | "bookedFrom">>;

function make(seed: Seed): CalEvent {
  const id = `e${nextId++}`;
  const service = seed.serviceId ? services.find((s) => s.id === seed.serviceId) : undefined;
  const history =
    seed.kind === "service"
      ? [
          { at: seed.date, time: Math.max(seed.start - 2, 0), text: "SMS reminder sent" },
          { at: seed.date, time: Math.max(seed.start - 720, 0), text: "Email reminder sent" },
          {
            at: seed.date,
            time: h(15, 5),
            actor: seed.title.split(" ")[0],
            text: `Booked ${service?.name ?? seed.title} with ${seed.title}`,
          },
        ]
      : [{ at: seed.date, time: h(9), actor: "Igor", text: `Created ${seed.title}` }];
  return {
    repeat: { type: "none" },
    source: "setmore",
    bookedFrom: "Web App",
    ...seed,
    id,
    bookingId: bookingId(),
    history,
  };
}

const meet = (slug: string) => ({ provider: "google-meet" as const, url: `https://meet.google.com/${slug}` });

/** Seeds appointments around `today`, shaped like the reference screenshots. */
export function seedEvents(today: Date): CalEvent[] {
  nextId = 1;
  const monday = startOfWeek(today);
  const on = (offset: number) => toKey(addDays(monday, offset));
  const until = (years: number) => toKey(addDays(today, 365 * years));
  const weekdaysRepeat: Repeat = { type: "weekdays", until: until(2) };
  const out: CalEvent[] = [];

  // Igor's own week (matches the "Your calendar" screenshot).
  out.push(
    make({ kind: "event", title: "Jordan Hale for Igor", staffId: ME, date: on(0), start: h(9), end: h(9, 30), color: "blue", source: "google" }),
    make({ kind: "event", title: "Igor - Weekly sync", staffId: ME, date: on(0), start: h(9, 15), end: h(9, 45), color: "blue", source: "google" }),
    make({ kind: "event", title: "Igor - Meet Jordan", staffId: ME, date: on(0), start: h(9, 30), end: h(10), color: "blue", source: "google" }),
    make({ kind: "event", title: "Igor Rodriguez 1:1", staffId: ME, date: on(0), start: h(10), end: h(10, 30), color: "blue", source: "google", video: meet("abc-defg-hij") }),
    make({ kind: "event", title: "Igor - Review", staffId: ME, date: on(0), start: h(10, 15), end: h(10, 45), color: "blue", source: "google", video: meet("klm-nopq-rst") }),
    make({ kind: "event", title: "Igor Rodriguez", staffId: ME, date: on(0), start: h(10, 30), end: h(11), color: "blue", source: "google" }),
    make({ kind: "event", title: "Marketing check-in", staffId: ME, date: on(0), start: h(10, 30), end: h(11), color: "blue", video: meet("uvw-xyza-bcd") }),
    make({ kind: "event", title: "Catch up", staffId: ME, date: on(0), start: h(11, 30), end: h(12), color: "blue", video: meet("efg-hijk-lmn") }),
    make({ kind: "event", title: "Learning Around Infinite Games", staffId: ME, date: on(0), start: h(14), end: h(14, 15), color: "blue", video: meet("opq-rstu-vwx") }),
    make({ kind: "event", title: "LUCY - Product Demo Day", staffId: ME, date: on(1), start: h(10), end: h(11), color: "dark-green", video: meet("yza-bcde-fgh"), repeat: { type: "weekly", until: until(1) } }),
    make({ kind: "event", title: "Design System", staffId: ME, date: on(2), start: h(8, 15), end: h(9), color: "blue", video: meet("ijk-lmno-pqr") }),
    make({ kind: "event", title: "Igor - Meet Jordan", staffId: ME, date: on(4), start: h(10), end: h(10, 30), color: "blue" }),
    make({ kind: "event", title: "Happy birthday! (Day 1/1)", staffId: ME, date: toKey(new Date(today.getFullYear() + 1, 2, 28)), start: 0, end: h(24), allDay: true, color: "blue", source: "google", repeat: { type: "annually" } }),
  );

  // Maya's calendar: recurring blocks plus customer bookings (matches the team member screenshots).
  const maya = "s1";
  out.push(
    make({ kind: "event", title: "For Calls", staffId: maya, date: on(0), start: h(11), end: h(12), color: "blue", repeat: weekdaysRepeat }),
    make({ kind: "event", title: "For Tasks", staffId: maya, date: on(0), start: h(16, 30), end: h(17, 30), color: "blue", repeat: { type: "daily", until: until(2) } }),
    make({ kind: "event", title: "IT Interview", staffId: maya, date: on(2), start: h(13), end: h(13, 30), color: "blue", video: meet("it-intv-001") }),
    make({ kind: "event", title: "People & Culture Team Meeting", staffId: maya, date: on(2), start: h(13), end: h(13, 30), color: "blue", video: meet("pc-team-002") }),
    make({ kind: "event", title: "Process Trainer - Interview", staffId: maya, date: on(2), start: h(17, 30), end: h(18, 30), color: "blue", video: meet("proc-trn-003") }),
    make({ kind: "event", title: "CSM recruitment Discussion", staffId: maya, date: on(3), start: h(10, 30), end: h(11), color: "blue", video: meet("csm-rec-004") }),
    make({ kind: "service", title: "Avery Quinn", staffId: maya, date: on(0), start: h(9, 30), end: h(10), color: "red", serviceId: "svc-30", customerIds: ["c2"], video: meet("ppf-qqqs-vof"), bookedFrom: "Booking Page", notes: "Hi, my full name is Avery Quinn-Hollis and I can't edit my name on the booking page." }),
    make({ kind: "service", title: "Riley Brooks x Casey Morgan", staffId: maya, date: on(1), start: h(10, 30), end: h(11), color: "red", serviceId: "svc-30", customerIds: ["c3", "c4"], video: meet("rbc-mrgn-005") }),
    make({ kind: "service", title: "Taylor Reed", staffId: maya, date: on(1), start: h(13, 30), end: h(14), color: "orange", serviceId: "svc-30b", customerIds: ["c5"], video: meet("tyl-reed-006") }),
  );

  // A busier month for Maya, so Month and Agenda views have something to show.
  const rand = random(7);
  const monthStart = startOfMonth(today);
  for (let i = 0; i < 42; i++) {
    const day = addDays(monthStart, i - 7);
    if (weekdayIndex(day) > 4) continue;
    const count = Math.floor(rand() * 5);
    for (let n = 0; n < count; n++) {
      const startMin = h(9) + Math.floor(rand() * 16) * 30;
      const customer = customers[Math.floor(rand() * customers.length)];
      const isService = rand() < 0.6;
      const service = services[Math.floor(rand() * 2)];
      out.push(
        isService
          ? make({ kind: "service", title: customer.name, staffId: maya, date: toKey(day), start: startMin, end: startMin + service.duration, color: service.color, serviceId: service.id, customerIds: [customer.id], video: meet(`m-${i}-${n}`) })
          : make({ kind: "event", title: ["Quality updates", "Meeting with partners", "Recruitment Call", "HR sync", "Interview", "Data review"][Math.floor(rand() * 6)], staffId: maya, date: toKey(day), start: startMin, end: startMin + 30, color: rand() < 0.15 ? "yellow" : "blue", video: rand() < 0.7 ? meet(`x-${i}-${n}`) : undefined }),
      );
    }
  }

  // Theo's day: an early shift with overlapping stand-ups, plus a Google event.
  const theo = "s2";
  out.push(
    make({ kind: "event", title: "CloudOps DSM", staffId: theo, date: on(weekdayIndex(today)), start: h(3, 45), end: h(4), color: "blue", video: meet("cld-ops-007"), repeat: weekdaysRepeat }),
    make({ kind: "event", title: "Security Standup Meeting", staffId: theo, date: on(weekdayIndex(today)), start: h(3, 45), end: h(4), color: "blue", video: meet("sec-std-008") }),
    make({ kind: "event", title: "DevOps DSM", staffId: theo, date: on(weekdayIndex(today)), start: h(4, 15), end: h(4, 30), color: "blue", video: meet("dev-ops-009") }),
    make({ kind: "event", title: "Review Security Video", staffId: theo, date: on(weekdayIndex(today)), start: h(6), end: h(7), color: "blue" }),
    make({ kind: "event", title: "Switch Board Security Check-in", staffId: theo, date: on(weekdayIndex(today)), start: h(7, 30), end: h(7, 45), color: "blue", video: meet("swb-sec-010") }),
    make({ kind: "event", title: "IT Operations Review", staffId: theo, date: on(weekdayIndex(today)), start: h(8), end: h(9), color: "blue", video: meet("ito-rev-011") }),
    make({ kind: "event", title: "IT Goals - Weekly Meeting", staffId: theo, date: on(weekdayIndex(today)), start: h(10), end: h(11), color: "blue", video: meet("itg-wkl-012") }),
    make({ kind: "event", title: "SecOps Evening Sync Call", staffId: theo, date: on(weekdayIndex(today)), start: h(10, 15), end: h(10, 30), color: "blue", video: meet("sec-eve-013") }),
    make({ kind: "event", title: "Theo + Priya Security sync", staffId: theo, date: on(weekdayIndex(today)), start: h(11, 30), end: h(12, 30), color: "blue", source: "google", video: meet("tps-sec-014") }),
  );

  // Priya keeps a private Google calendar, so other people only see "Busy".
  const priya = "s3";
  const busy = (start: number, end: number): Seed => ({ kind: "event", title: "Private", staffId: priya, date: on(weekdayIndex(today)), start, end, color: "gray", source: "google", isPrivate: true });
  out.push(
    make(busy(h(11), h(11, 30))),
    make(busy(h(11, 30), h(11, 45))),
    make(busy(h(12), h(13))),
    make(busy(h(14), h(15))),
    make(busy(h(15, 30), h(15, 45))),
    make(busy(h(15, 30), h(15, 45))),
    make(busy(h(16), h(17))),
  );

  return out;
}

/** The colours offered by the Event tab's swatch picker, in Setmore's order. */
export const eventSwatches: PaletteColor[] = ["blue", "red", "orange", "yellow", "violet", "dark-blue", "maroon", "gray", "dark-green", "green"];
