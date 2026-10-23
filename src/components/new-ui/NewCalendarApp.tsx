"use client";

// New mode (design/new): the Setmore light-refresh calendar. Built from the shadcn components in
// ./ui, styled only with EDS Setmore tokens. Everything renders inside html[data-ds="new"] so the
// New styles never collide with the EDS, shadcn or Test kits.
//
// Build order (see design/new/docs/calendar-spec.md):
//   1. Work week (Calendar-Fix.png)   ← this file
//   2. Hover preview with Join        ← this file (stub)
//   3. Event details side panel       ← this file (stub)
//   Steps 4–6 are tracked as TODOs.
//
// The data below is a self-contained mock of the Fri 2 Oct 2026 anchor used throughout the design
// boards. The rest of the prototype's state is intentionally not shared: New mode is isolated.

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Home as HomeIcon,
  Inbox,
  LifeBuoy,
  Link2,
  List,
  Menu as MenuIcon,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Puzzle,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  UserCircle,
  Users as UsersIcon,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatDayHead, formatRangeTitle, renderRange, renderTime, timeOn, LOCALE, TZ } from "./intl";
import { cn } from "@/lib/utils";

// ---------- Data (made up, matches the boards) ---------------------------------

type PersonId = "ml" | "ji" | "al" | "mi" | "ju" | "xe" | "na" | "ha" | "ud" | "to";
type Palette = "green" | "blue" | "orange";
type Source = "setmore" | "google" | "team";

const PEOPLE: Record<PersonId, { name: string; first: string; palette: Palette; job?: string }> = {
  ml: { name: "Marine Lasserre", first: "Marine", palette: "orange", job: "Product designer" },
  ji: { name: "Jillian", first: "Jillian", palette: "green", job: "Head of people" },
  al: { name: "Alicia", first: "Alicia", palette: "orange", job: "People operations" },
  mi: { name: "Michael", first: "Michael", palette: "blue", job: "Founder" },
  ju: { name: "Julia", first: "Julia", palette: "orange", job: "Design lead" },
  xe: { name: "Xenia", first: "Xenia", palette: "orange", job: "Product manager" },
  na: { name: "Naresh", first: "Naresh", palette: "blue", job: "Backend engineer" },
  ha: { name: "Hannah", first: "Hannah", palette: "orange", job: "Content designer" },
  ud: { name: "Udhaya", first: "Udhaya", palette: "orange", job: "Frontend engineer" },
  to: { name: "Tomek", first: "Tomek", palette: "blue", job: "Customer success" },
};

// Spec: Setmore = moss (green), Google = lake (blue), shared team = clay (orange).
const SOURCE_PALETTE: Record<Source, Palette> = { setmore: "green", google: "blue", team: "orange" };

// All times are minutes from midnight.
const h = (hour: number, minute = 0) => hour * 60 + minute;
type EventInput = {
  id: string;
  day: number; // Mon=0 … Sun=6
  start: number;
  end: number;
  title: string;
  guests: PersonId[]; // organizer first
  source: Source;
  meet?: string;
  note?: string;
  isPrivate?: boolean;
};
const EVENTS: EventInput[] = [
  // Mon 28
  { id: "welcome1", day: 0, start: h(8, 30), end: h(8, 45), title: "Welcome to the team", guests: ["al", "ml"], source: "google" },
  { id: "meet1", day: 0, start: h(9), end: h(9, 30), title: "Meet with Marine", guests: ["ji", "ml"], source: "google", meet: "kfa-wqzp-tnd" },
  { id: "welcome2", day: 0, start: h(10, 30), end: h(11, 30), title: "Welcome to AnywhereWorks", guests: ["mi", "ji", "al", "ml"], source: "google", meet: "ywd-pkre-hoa" },
  // Tue 29
  { id: "julia", day: 1, start: h(9), end: h(9, 30), title: "Marine / Julia – interviews", guests: ["ju", "ml"], source: "google", meet: "mzt-ahsc-qwe" },
  { id: "lucy", day: 1, start: h(10), end: h(11), title: "LUCY – Product sync", guests: ["xe", "na", "ud", "ml", "ji", "mi"], source: "google", meet: "qhw-ndzu-fkr" },
  { id: "crit", day: 1, start: h(14), end: h(15), title: "Design critique", guests: ["xe", "to", "ml"], source: "team", meet: "dcr-mzpq-hwe" },
  // Wed 30
  { id: "bp", day: 2, start: h(9), end: h(10), title: "Booking page review", guests: ["ml", "ha", "ud"], source: "setmore", meet: "bpr-vxkd-alq" },
  { id: "audit", day: 2, start: h(11), end: h(11, 45), title: "Audit walkthrough", guests: ["ml", "ji"], source: "setmore", meet: "aud-pqne-zus" },
  { id: "handoff", day: 2, start: h(15, 30), end: h(16), title: "Booking page handoff", guests: ["ud", "na", "ml"], source: "team", meet: "bph-trwa-kcd" },
  // Thu 1
  { id: "lister", day: 3, start: h(10), end: h(10, 45), title: "Lister Place feedback", guests: ["ha", "ml"], source: "google", meet: "lpf-eqmd-ksw" },
  { id: "tomek", day: 3, start: h(14), end: h(15), title: "Brand × onboarding", guests: ["ml", "to"], source: "setmore", meet: "brd-yrkw-mnq" },
  { id: "dentist", day: 3, start: h(16), end: h(17), title: "Dentist", guests: ["ml"], source: "setmore", isPrivate: true, note: "Bring the insurance card." },
  // Fri 2 (today)
  { id: "standup", day: 4, start: h(9), end: h(9, 15), title: "Design stand-up", guests: ["xe", "ml", "to"], source: "google", meet: "std-pfqx-wec" },
  { id: "onboarding", day: 4, start: h(9, 45), end: h(10, 15), title: "Onboarding check-in", guests: ["ji", "ml"], source: "google", meet: "onb-hzqa-twd", note: "Go through the path chooser and the “switching tools” import step." },
  { id: "michael", day: 4, start: h(14), end: h(15), title: "Catch-up with Michael", guests: ["mi", "ji", "ml"], source: "setmore", meet: "cmu-tsxp-rfa" },
  { id: "prep", day: 4, start: h(16), end: h(16, 30), title: "Interview prep", guests: ["ju", "ml"], source: "google" },
];

// The visible week: Mon 28 Sep 2026 → Sun 4 Oct 2026, today = Fri 2 Oct, now = 9:34 EDT.
const MONDAY = new Date(2026, 8, 28);
const TODAY_IDX = 4;
const NOW_MINUTES = h(9, 34);
const WORK_DAYS = [0, 1, 2, 3, 4]; // Mon–Fri

// ---------- Primitives ----------------------------------------------------------

// Grid math: hour row height. The grid covers all 24 hours but opens scrolled to the working
// hours (8AM–5PM here) so earlier/later meetings are still reachable by scrolling.
const HOUR = 78;
const DAY_START = 0;
const DAY_END = 24;
const WORK_START = 8;
const WORK_END = 17;
const GRID_HEIGHT = (DAY_END - DAY_START) * HOUR;
// Scroll target: 1 hour before the working day, as the spec asks.
const INITIAL_SCROLL = (WORK_START - 1) * HOUR;

// Tree-mark logo for AnywhereWorks (built inline — the design is a stylised pine).
function AWMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5 4 6h2L3 10h3l-2.5 3h9L10 10h3l-3-4h2L8 1.5Z" />
      <path d="M8 13v2" />
    </svg>
  );
}

// Clock-face icon for the Time clock row (a plain outline clock, matches EDS's ClockIcon shape).
function ClockFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}

/** Collapses the sidebar below `px` so the week keeps breathing room on narrow laptops / tablets. */
function useNarrow(px: number) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [px]);
  return narrow;
}

// A multicoloured dot row for the Calendars chip. Shows 3 overlapping dots.
function CalendarsSwatch({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-hidden>
      <span className="h-[10px] w-[10px] rounded-full bg-pal-green-border" />
      <span className="-ml-[3px] h-[10px] w-[10px] rounded-full ring-2 ring-background bg-pal-dark-blue-border" />
      <span className="-ml-[3px] h-[10px] w-[10px] rounded-full ring-2 ring-background bg-pal-orange-border" />
    </span>
  );
}

// Ghost icon button: hover fill, focus ring, tooltip = aria-label. All icon-only buttons use this.
function GhostIcon({ label, onClick, children, className }: { label: string; onClick?: () => void; children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-md text-foreground/80 transition-colors duration-fast",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            className,
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="rounded-md bg-inverse px-2 py-1 text-xs text-inverse-foreground">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function Initials({ person, size = 20 }: { person: PersonId; size?: number }) {
  const p = PEOPLE[person];
  const letter = person === "ml" ? "ML" : p.first[0];
  return (
    <Avatar
      className={cn(
        "shrink-0 ring-1 ring-background",
        {
          "bg-pal-orange-bg text-pal-orange-text": p.palette === "orange",
          "bg-pal-green-bg text-pal-green-text": p.palette === "green",
          "bg-pal-blue-bg text-pal-blue-text": p.palette === "blue",
        },
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      <AvatarFallback className="bg-transparent text-current font-medium">{letter}</AvatarFallback>
    </Avatar>
  );
}

// Day header "28 Mon" with today's number in a filled brand circle.
function DayHeading({ date, isToday }: { date: Date; isToday: boolean }) {
  const { num, day } = formatDayHead(date);
  return (
    <div className="flex h-dayhead items-center gap-[7px] px-3 border-l border-line first:border-l-0">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full text-sm font-semibold",
          isToday ? "bg-primary text-primary-foreground" : "text-foreground",
        )}
      >
        {num}
      </span>
      <span className={cn("text-sm", isToday ? "text-foreground font-medium" : "text-muted-foreground")}>{day}</span>
    </div>
  );
}

// Event card. 4px radius, 3px coloured left bar, 11px left padding so text clears the bar.
function EventCard({ ev, onOpen, selectedId }: { ev: EventInput; onOpen: (id: string) => void; selectedId: string | null }) {
  const palette = SOURCE_PALETTE[ev.source];
  const startDate = useMemo(() => timeOn(dayDate(ev.day), ev.start), [ev]);
  const endDate = useMemo(() => timeOn(dayDate(ev.day), ev.end), [ev]);
  const duration = ev.end - ev.start;
  // Card sizes from the design: 1h = 72, 30m = 36, 15m = 18 (hour row is 78, so 6px gap).
  // Centre the card inside its slot so a 1h card sits in the middle of the 78px hour row.
  const height = Math.max((duration * (HOUR - 6)) / 60, 18);
  const slot = (duration * HOUR) / 60;
  const top = (ev.start - DAY_START * 60) * (HOUR / 60) + Math.max((slot - height) / 2, 0);
  // 15-min cards: title only. 30-min: title + time · person. 45+: title + range + optional avatars.
  const veryShort = duration <= 15;
  const short = duration < 60;
  const isLive = ev.day === TODAY_IDX && ev.start <= NOW_MINUTES && ev.end > NOW_MINUTES;
  const soon = ev.day === TODAY_IDX && ev.start > NOW_MINUTES && ev.start - NOW_MINUTES <= 15;
  const isPast = ev.day < TODAY_IDX || (ev.day === TODAY_IDX && ev.end <= NOW_MINUTES);
  const others = ev.guests.filter((g) => g !== "ml");
  // Spec: hover card opens to the right for the left half of the week, left for the right half.
  const hoverSide = ev.day <= 2 ? "right" : "left";
  // Spec: hover card is suppressed on the card whose details panel is open, and on the selected card
  // gets a 2px brand ring instead.
  const isSelected = selectedId === ev.id;

  if (ev.isPrivate && !["dentist"].includes(ev.id)) return null;
  const isMinePrivate = ev.isPrivate; // only the owner sees details

  const bgClass = {
    green: "bg-pal-green-bg text-pal-green-text",
    blue: "bg-pal-blue-bg text-pal-blue-text",
    orange: "bg-pal-orange-bg text-pal-orange-text",
  }[palette];
  const barClass = {
    green: "bg-pal-green-border",
    blue: "bg-pal-blue-border",
    orange: "bg-pal-orange-border",
  }[palette];

  return (
    // Spec: suppress the hover card on the card whose details panel is open.
    <HoverCard openDelay={120} closeDelay={60} open={isSelected ? false : undefined}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onOpen(ev.id)}
          className={cn(
            "absolute left-1 right-1 overflow-hidden rounded-sm text-left transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            isSelected && "ring-2 ring-primary",
            bgClass,
          )}
          style={{ top, height }}
        >
          <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", barClass)} />
          <span className={cn("flex flex-col pl-[11px] pr-2", veryShort ? "gap-0 py-0 justify-center h-full" : short ? "gap-0 py-0.5" : "gap-0.5 py-1.5")}>
            <span className="flex items-center gap-1 min-w-0">
              {isMinePrivate && <span aria-label="Private" className="inline-grid place-items-center text-[10px]">🔒</span>}
              <span className={cn("truncate font-medium", short ? "text-[13px] leading-4" : "text-sm leading-tight")}>{ev.title}</span>
              {(isLive || soon) && ev.meet ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-pal-green-border bg-background px-1.5 py-[1px] text-[11px] font-medium text-pal-green-text">
                  <Video className="h-3 w-3" /> Join
                </span>
              ) : ev.meet && !veryShort ? (
                <Video className="h-[14px] w-[14px] shrink-0 opacity-80 ml-auto" aria-hidden />
              ) : null}
            </span>
            {!veryShort && (
              <span className={cn("truncate opacity-80", short ? "text-[11px] leading-[14px]" : "text-xs")}>
                {short && duration <= 30
                  ? <>{renderTime(startDate, { hourOnly: true })} · {PEOPLE[ev.guests.find((g) => g !== "ml") ?? ev.guests[0]].first}</>
                  : renderRange(startDate, endDate)}
              </span>
            )}
            {duration >= 60 && others.length > 0 && (
              <span className="mt-0.5 flex items-center gap-1 min-w-0">
                <span className="flex">
                  {others.slice(0, 3).map((g) => (
                    <span key={g} className="-mr-1 last:mr-0">
                      <Initials person={g} size={16} />
                    </span>
                  ))}
                </span>
                <span className="ml-1 truncate text-xs opacity-80">
                  {others.slice(0, 2).map((g) => PEOPLE[g].first).join(", ")}
                  {others.length > 2 ? ` +${others.length - 2}` : ""}
                </span>
              </span>
            )}
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side={hoverSide}
        align="start"
        sideOffset={10}
        className="w-hover rounded-xl border border-border bg-popover p-4 shadow-lg"
      >
        <div className="flex gap-3">
          <span aria-hidden className={cn("mt-1 h-3 w-3 shrink-0 rounded-sm", barClass)} />
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold leading-tight truncate">{ev.title}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "short" }).format(dayDate(ev.day))} · {renderRange(startDate, endDate)}
            </div>
            {(isLive || soon || isPast) && (
              <div className={cn("mt-1 text-xs font-medium", isPast ? "text-muted-foreground" : "text-caution")}>
                {isLive ? "Happening now" : soon ? `Starts in ${ev.start - NOW_MINUTES} min` : "Ended"}
              </div>
            )}
          </div>
        </div>
        {ev.meet && (
          <div className="mt-3 flex gap-2">
            {/* Spec: an ended event turns Join into an outline button so it no longer competes. */}
            <Button className="h-10 flex-1 rounded-full" variant={isPast ? "outline" : "secondary"}>
              <Video className="h-4 w-4" /> Join Google Meet
            </Button>
            <GhostIcon label={`Copy link · meet.google.com/${ev.meet}`}>
              <Copy className="h-4 w-4" />
            </GhostIcon>
          </div>
        )}
        <div className="mt-3 flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground">{ev.guests.length} {ev.guests.length === 1 ? "guest" : "guests"}</div>
          {ev.guests.map((g, i) => (
            <div key={g} className="flex items-center gap-2 text-sm">
              <Initials person={g} size={24} />
              <span className="truncate">{g === "ml" ? "Marine Lasserre (you)" : PEOPLE[g].name}</span>
              {i === 0 && <span className="ml-auto text-xs text-muted-foreground">Organizer</span>}
            </div>
          ))}
        </div>
        {ev.note && (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm leading-5 text-foreground/80">{ev.note}</p>
        )}
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {ev.source === "google" ? "From Google Calendar" : ev.source === "team" ? "Design team calendar" : "Setmore calendar"}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function dayDate(day: number) {
  const d = new Date(MONDAY);
  d.setDate(MONDAY.getDate() + day);
  return d;
}

// ---------- Sidebar -------------------------------------------------------------

const NAV: { icon: React.ElementType; label: string; current?: boolean; badge?: number }[] = [
  { icon: HomeIcon, label: "Home" },
  { icon: Sparkles, label: "Grow your brand" },
  { icon: CalendarDays, label: "Calendar", current: true },
  { icon: Inbox, label: "Receptionist" },
  { icon: List, label: "Services" },
  { icon: MessageSquare, label: "Connect" },
  { icon: UsersIcon, label: "Customers" },
  { icon: Wallet, label: "Payments" },
  { icon: Puzzle, label: "Integrations" },
  { icon: SettingsIcon, label: "Settings" },
];

function NewSidebar({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    // Icons-only rail: keeps the same information architecture on narrow screens.
    return (
      <nav aria-label="Primary" className="flex w-rail shrink-0 flex-col items-center border-r border-line bg-background py-3 gap-1">
        <span className="mb-3 grid h-7 w-7 place-items-center text-[#1B3D32]"><AWMark className="h-6 w-6" /></span>
        {NAV.map(({ icon: Icon, label, current }) => (
          <GhostIcon key={label} label={label}>
            <Icon className={cn("h-4 w-4", current && "text-primary")} />
          </GhostIcon>
        ))}
        <div className="mt-auto" />
        <GhostIcon label="Clock in"><ClockFace className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Help & Support"><LifeBuoy className="h-4 w-4" /></GhostIcon>
        <span className="relative mt-1">
          <Initials person="ml" size={28} />
          <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-status-available" />
        </span>
      </nav>
    );
  }
  return (
    <nav aria-label="Primary" className="flex w-nav shrink-0 flex-col border-r border-line bg-background">
      <div className="flex h-[64px] items-center gap-2 px-4">
        <span className="grid h-7 w-7 place-items-center text-[#1B3D32]"><AWMark className="h-6 w-6" /></span>
        <span className="flex-1 text-base font-semibold leading-tight">AnywhereWorks</span>
        <GhostIcon label="Collapse menu">
          <MenuIcon className="h-4 w-4" />
        </GhostIcon>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV.map(({ icon: Icon, label, current }) => (
          <a
            key={label}
            href="#"
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-foreground transition-colors duration-fast hover:bg-accent",
              current && "bg-accent font-medium",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            <span className="truncate">{label}</span>
          </a>
        ))}
      </div>
      <div className="flex flex-col gap-1 px-3 py-3">
        <div className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm">
          <ClockFace className="h-4 w-4 shrink-0 text-foreground/70" />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-sm">Time clock</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-status-offline" /> Clocked out
            </span>
          </span>
          <Button variant="secondary" size="sm" className="h-7 shrink-0 rounded-full px-3 text-sm">
            Clock in
          </Button>
        </div>
        <a href="#" className="flex h-10 items-center gap-3 rounded-md px-3 text-sm hover:bg-accent">
          <LifeBuoy className="h-4 w-4 opacity-80" />
          Help & Support
        </a>
        <div className="mt-1 flex items-center gap-3 rounded-md px-3 py-2">
          <span className="relative shrink-0">
            <Initials person="ml" size={32} />
            <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-status-available" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">Marine Lasserre</span>
            <span className="truncate text-xs text-muted-foreground">Available</span>
          </span>
        </div>
      </div>
    </nav>
  );
}

// ---------- Toolbar + grid ------------------------------------------------------

// ---------- Calendars list, ⋯ menu, Time zones ---------------------------------

type CalendarKey = "setmore" | "google" | "team" | PersonId;
type View = "day" | "work" | "week" | "month" | "team";
type ExtraZone = { id: string; name: string; abbr: string; offsetHours: number; };

const OWN_CALENDARS: { key: CalendarKey; label: string; type: string; swatch: Palette }[] = [
  { key: "setmore", label: "Marine Lasserre (you)", type: "Setmore calendar", swatch: "green" },
  { key: "google", label: "marine.lasserre@anywhere.co", type: "Google Calendar", swatch: "blue" },
  { key: "team", label: "Design team", type: "Shared calendar", swatch: "orange" },
];

const TEAM_MEMBERS: PersonId[] = ["ji", "xe", "to", "ju"];

const TZ_PRESETS: ExtraZone[] = [
  { id: "london", name: "", abbr: "BST", offsetHours: 5 }, // 5h ahead of EDT
  { id: "india", name: "", abbr: "IST", offsetHours: 9.5 },
  { id: "pacific", name: "", abbr: "PDT", offsetHours: -3 },
  { id: "tokyo", name: "", abbr: "JST", offsetHours: 13 },
];

function wrap24(hours: number) {
  const m = Math.round(((hours % 24) + 24) % 24 * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  const base = new Date();
  base.setHours(hh, mm, 0, 0);
  return base;
}

function CalendarsPopover({ compact, checked, onToggle }: {
  compact: boolean;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 rounded-full border-border px-3 text-sm">
          <CalendarsSwatch className="mr-1" />
          {!compact && "Calendars"}
          <ChevronDown className="h-3.5 w-3.5 text-foreground/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-menu rounded-xl p-2 shadow-lg">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <span className="text-sm font-semibold">Calendars</span>
          <button type="button" className="text-xs font-medium text-brand-on-tonal hover:underline">See side by side</button>
        </div>
        <div className="flex max-h-80 flex-col overflow-y-auto">
          {OWN_CALENDARS.map((c) => (
            <CalendarRow key={c.key} checked={!!checked[c.key]} onToggle={() => onToggle(c.key)} swatch={c.swatch} label={c.label} type={c.type} />
          ))}
          {TEAM_MEMBERS.map((p) => (
            <CalendarRow key={p} checked={!!checked[p]} onToggle={() => onToggle(p)} person={p} label={PEOPLE[p].name} type="Team member" />
          ))}
        </div>
        <div className="mt-1 border-t border-line pt-1">
          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
            <SettingsIcon className="h-4 w-4 text-foreground/70" />
            <span className="flex-1 text-left">Connect & manage in Settings</span>
            <ChevronRight className="h-3.5 w-3.5 text-foreground/60" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CalendarRow({
  checked,
  onToggle,
  label,
  type,
  swatch,
  person,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  type: string;
  swatch?: Palette;
  person?: PersonId;
}) {
  const swatchClass = swatch === "green" ? "bg-pal-green-border" : swatch === "blue" ? "bg-pal-blue-border" : swatch === "orange" ? "bg-pal-orange-border" : "";
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent">
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 rounded accent-primary" />
      {person ? (
        <Initials person={person} size={24} />
      ) : (
        <span className={cn("h-5 w-5 shrink-0 rounded", swatchClass)} />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm">{label}</span>
        <span className="truncate text-xs text-muted-foreground">{type}</span>
      </span>
    </label>
  );
}

function MoreMenu({ view, onView, onZones, onShare }: {
  view: View;
  onView: (v: View) => void;
  onZones: () => void;
  onShare: () => void;
}) {
  const views: { k: View; label: string; right?: string }[] = [
    { k: "day", label: "Day" },
    { k: "work", label: "Work week", right: "Mon–Fri" },
    { k: "week", label: "Week", right: "7 days" },
    { k: "month", label: "Month" },
    { k: "team", label: "Team day", right: "Side by side" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="More options"
          className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-menu">
        <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">View</div>
        {views.map((v) => (
          <DropdownMenuItem key={v.k} onSelect={() => onView(v.k)} className="justify-between">
            <span className="flex items-center gap-2">
              {view === v.k ? <Check className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
              {v.label}
            </span>
            {v.right && <span className="text-xs text-muted-foreground">{v.right}</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem><CalendarDays className="h-4 w-4" /> Working days <span className="ml-auto text-xs text-muted-foreground">Mon–Fri</span></DropdownMenuItem>
        <DropdownMenuItem><SettingsIcon className="h-4 w-4" /> Time zone <span className="ml-auto text-xs text-muted-foreground">EDT</span></DropdownMenuItem>
        <DropdownMenuItem onSelect={onZones}><Plus className="h-4 w-4" /> Show more time zones</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onShare}><Link2 className="h-4 w-4" /> Share calendar</DropdownMenuItem>
        <DropdownMenuItem><SettingsIcon className="h-4 w-4" /> Calendar settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TimezonesPopover({
  open,
  onOpenChange,
  trigger,
  zones,
  setZones,
  ownName,
  setOwnName,
  show,
  setShow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactNode;
  zones: ExtraZone[];
  setZones: (z: ExtraZone[]) => void;
  ownName: string;
  setOwnName: (s: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const used = new Set(zones.map((z) => z.id));
  const canAdd = zones.length < 9;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-menu rounded-xl p-0 shadow-lg">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <span className="text-sm font-semibold">Time zones</span>
          <GhostIcon label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </GhostIcon>
        </div>
        <div className="px-3 pb-2">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs font-medium text-muted-foreground">Your time zone</div>
            <input
              value={ownName}
              onChange={(e) => setOwnName(e.target.value)}
              placeholder="EDT"
              aria-label="Label for your time zone"
              className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-1 text-xs text-muted-foreground">Eastern Time (UTC−4)</div>
          </div>
        </div>
        {zones.length > 0 && (
          <label className="flex items-center gap-2 px-4 py-2 text-sm">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-primary" />
            <span className="flex-1">Show additional time zones</span>
          </label>
        )}
        <div className="max-h-64 overflow-y-auto border-t border-line">
          {zones.map((z, i) => (
            <div key={z.id} className="flex items-start gap-2 px-4 py-2">
              <div className="flex-1 min-w-0">
                <input
                  value={z.name}
                  onChange={(e) => {
                    const copy = zones.slice();
                    copy[i] = { ...z, name: e.target.value };
                    setZones(copy);
                  }}
                  placeholder={z.abbr}
                  aria-label={`Label for ${z.abbr}`}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {z.id === "london" ? "London" : z.id === "india" ? "India" : z.id === "pacific" ? "Los Angeles" : "Tokyo"} · {z.abbr} · now <TimePart date={wrap24((NOW_MINUTES / 60) + z.offsetHours)} />
                </div>
              </div>
              <GhostIcon label="Remove" onClick={() => setZones(zones.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </GhostIcon>
            </div>
          ))}
        </div>
        {canAdd ? (
          <div className="border-t border-line p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-brand-on-tonal hover:bg-accent">
                  <Plus className="h-4 w-4" /> Add a time zone
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {TZ_PRESETS.filter((p) => !used.has(p.id)).map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => setZones([...zones, { ...p }])}>
                    {p.id === "london" ? "London" : p.id === "india" ? "India" : p.id === "pacific" ? "Los Angeles" : "Tokyo"} · {p.abbr}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="border-t border-line p-3 text-xs text-muted-foreground">
            You can show up to 10 time zones. Remove one to add another.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Renders a short time (e.g. 2:34PM) using the shared Intl helpers but inlined so it works where
// renderTime's wrappers aren't convenient.
function TimePart({ date }: { date: Date }) {
  const parts = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "numeric", hour12: true }).formatToParts(date);
  const buf: React.ReactNode[] = [];
  for (const p of parts) {
    if (p.type === "literal" && p.value === " ") continue;
    if (p.type === "dayPeriod") buf.push(<span key={buf.length} className="text-[0.86em]">{p.value.toUpperCase()}</span>);
    else buf.push(<span key={buf.length}>{p.value}</span>);
  }
  return <>{buf}</>;
}

// ---------- New dialog ---------------------------------------------------------
// Spec: opens on the Event tab, 400px wide, with a Create primary button that's always visible on
// every tab (staging issue 11). Fields in the demo path: title, date/time, Add guests, Location,
// Google Meet switch (on by default), Private switch, Notes for guests. From the toolbar New button
// the dialog opens as a modal; opening from a time slot (spec staging 4) is deferred.
function NewDialog({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"event" | "service" | "class" | "reminder">("event");
  const [title, setTitle] = useState("");
  const [meet, setMeet] = useState(true);
  const [priv, setPriv] = useState(false);
  const close = () => setOpen(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-8 rounded-full px-4 text-sm">
          <Plus className="h-4 w-4" /> {!compact && "New"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-dialog max-w-dialog gap-0 rounded-xl p-0 shadow-xl">
        <DialogTitle className="sr-only">New appointment</DialogTitle>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex flex-col">
          <TabsList className="mx-5 mt-5 grid h-9 grid-cols-4 rounded-full bg-muted p-0.5">
            <TabsTrigger value="event" className="rounded-full text-sm">Event</TabsTrigger>
            <TabsTrigger value="service" className="rounded-full text-sm">Service</TabsTrigger>
            <TabsTrigger value="class" className="rounded-full text-sm">Class</TabsTrigger>
            <TabsTrigger value="reminder" className="rounded-full text-sm">Reminder</TabsTrigger>
          </TabsList>
          <TabsContent value="event" className="m-0 flex flex-col gap-3 p-5">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title"
              className="h-11 rounded-lg border-border px-3 text-base"
              aria-label="Title"
            />
            <FieldRow icon={<CalendarDays className="h-4 w-4" />}>
              Fri 2 Oct · 12 – 12:30PM
            </FieldRow>
            <FieldRow icon={<UsersIcon className="h-4 w-4" />}>Add guests</FieldRow>
            <FieldRow icon={<Link2 className="h-4 w-4" />}>
              <span className="flex-1">
                <span className="block text-sm">Main location</span>
                <span className="block text-xs text-muted-foreground">[Street address], [City]</span>
              </span>
              <button type="button" className="text-xs font-medium text-brand-on-tonal hover:underline">Change</button>
            </FieldRow>
            <SwitchRow icon={<Video className="h-4 w-4" />} label={meet ? "Google Meet link added" : "Add Google Meet link"} checked={meet} onCheckedChange={setMeet} />
            <SwitchRow icon={<MessageSquare className="h-4 w-4" />} label="Private" sub="Others only see 'Busy', no details" checked={priv} onCheckedChange={setPriv} />
            <FieldRow icon={<List className="h-4 w-4" />}>
              <Textarea placeholder="Notes for guests" className="min-h-[36px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" />
            </FieldRow>
          </TabsContent>
          <TabsContent value="service" className="m-0 flex flex-col items-start gap-3 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><List className="h-5 w-5 text-foreground/70" /></div>
            <div className="text-base font-semibold">You're not assigned to any services yet</div>
            <p className="text-sm text-muted-foreground">An admin decides which services you can book. Your admins are <b>Jillian</b> and <b>Alicia</b>.</p>
            <div className="flex gap-2">
              <Button className="h-9 rounded-full px-4 text-sm">Request access</Button>
              <Button variant="outline" className="h-9 rounded-full px-4 text-sm" onClick={() => setTab("event")}>Create an event instead</Button>
            </div>
          </TabsContent>
          <TabsContent value="class" className="m-0 p-5 text-sm text-muted-foreground">
            No classes assigned yet.
          </TabsContent>
          <TabsContent value="reminder" className="m-0 flex flex-col gap-3 p-5">
            <Input placeholder="Remind me to…" className="h-11 rounded-lg border-border px-3 text-base" aria-label="Reminder" />
            <FieldRow icon={<Bell className="h-4 w-4" />}>Fri 2 Oct · 12PM</FieldRow>
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <span className="mr-auto text-xs text-muted-foreground">
            {tab === "event" && "Event is your default."}
          </span>
          <Button variant="ghost" className="h-9 rounded-full px-4 text-sm" onClick={close}>Cancel</Button>
          <Button className="h-9 rounded-full px-5 text-sm" onClick={close}>
            {tab === "reminder" ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-foreground/60">{icon}</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

function SwitchRow({ icon, label, sub, checked, onCheckedChange }: { icon: React.ReactNode; label: string; sub?: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground/60">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm">{label}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function NewToolbar({
  compact,
  view,
  setView,
  calsChecked,
  toggleCal,
  tzOpen,
  setTzOpen,
  zones,
  setZones,
  ownName,
  setOwnName,
  showZones,
  setShowZones,
}: {
  compact: boolean;
  view: View;
  setView: (v: View) => void;
  calsChecked: Record<string, boolean>;
  toggleCal: (k: string) => void;
  tzOpen: boolean;
  setTzOpen: (v: boolean) => void;
  zones: ExtraZone[];
  setZones: (z: ExtraZone[]) => void;
  ownName: string;
  setOwnName: (s: string) => void;
  showZones: boolean;
  setShowZones: (v: boolean) => void;
}) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const onShare = () => {
    // Spec: Share writes to the clipboard and confirms with a toast. Toast UI deferred.
    try { void navigator.clipboard?.writeText("https://setmore.example/cal/marine"); } catch {}
  };
  return (
    <header className="flex h-toolbar items-center gap-2 border-b border-line bg-background px-4 lg:px-5">
      <Button variant="ghost" className="h-8 rounded-md px-3 text-sm">Today</Button>
      <GhostIcon label="Previous week"><ChevronLeft className="h-4 w-4" /></GhostIcon>
      <GhostIcon label="Next week"><ChevronRight className="h-4 w-4" /></GhostIcon>
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex h-9 items-center gap-1 rounded-md px-2 text-lg font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {formatRangeTitle(MONDAY, dayDate(6))}
            <ChevronDown className="h-4 w-4 text-foreground/60" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto rounded-xl p-2 shadow-lg">
          {/* Spec: brand circle for the selected date, tonal on hover, ring for today, bold weekdays. */}
          <Calendar
            mode="single"
            selected={dayDate(TODAY_IDX)}
            weekStartsOn={1}
            onSelect={() => setDatePickerOpen(false)}
            captionLayout="label"
          />
        </PopoverContent>
      </Popover>
      <div className="ml-auto flex items-center gap-2">
        <CalendarsPopover compact={compact} checked={calsChecked} onToggle={toggleCal} />
        <NewDialog compact={compact} />
        <MoreMenu view={view} onView={setView} onZones={() => setTzOpen(true)} onShare={onShare} />
      </div>
    </header>
  );
}

// ---------- Event details side panel -------------------------------------------
// Docked right (380px, pushes the grid, never floats over). The header carries only Edit, ⋯ and
// Close; the body shows title/time/source, Join + copy, people with job titles and responses, the
// description and the reminder/booking id lines. Meetings someone else organized show the RSVP
// footer at the bottom (Accept / Decline / Reschedule as ghost buttons); meetings you organized
// put Cancel/Delete in the ⋯ menu instead.
function EventDetailsPanel({ ev, onClose }: { ev: EventInput; onClose: () => void }) {
  const [response, setResponse] = useState<"accept" | "decline" | "reschedule" | null>(null);
  const start = timeOn(dayDate(ev.day), ev.start);
  const end = timeOn(dayDate(ev.day), ev.end);
  const palette = SOURCE_PALETTE[ev.source];
  const barClass = {
    green: "bg-pal-green-border",
    blue: "bg-pal-blue-border",
    orange: "bg-pal-orange-border",
  }[palette];
  const isLive = ev.day === TODAY_IDX && ev.start <= NOW_MINUTES && ev.end > NOW_MINUTES;
  const soon = ev.day === TODAY_IDX && ev.start > NOW_MINUTES && ev.start - NOW_MINUTES <= 15;
  const isPast = ev.day < TODAY_IDX || (ev.day === TODAY_IDX && ev.end <= NOW_MINUTES);
  const isMine = ev.guests[0] === "ml";
  // Spec: "From Google Calendar" / shared calendar name only; Setmore meetings show no source line.
  const sourceLine =
    ev.source === "google" ? "From Google Calendar" : ev.source === "team" ? "Design team calendar" : null;
  const dateLine = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(dayDate(ev.day));

  return (
    <aside aria-label="Event details" className="flex w-panel shrink-0 flex-col border-l border-line bg-background">
      {/* Header: Edit, ⋯, Close only. No title. */}
      <div className="flex h-toolbar items-center justify-end gap-1 border-b border-line px-3">
        <GhostIcon label="Edit event"><Pencil className="h-4 w-4" /></GhostIcon>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More options"
              className="grid h-8 w-8 place-items-center rounded-md text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
            <DropdownMenuItem><Link2 className="h-4 w-4" /> Copy meeting link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> {ev.guests.length > 1 ? "Cancel event" : "Delete event"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <GhostIcon label="Close" onClick={onClose}><X className="h-4 w-4" /></GhostIcon>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        <div className="flex gap-3">
          <span aria-hidden className={cn("mt-1 h-3.5 w-3.5 shrink-0 rounded-sm", barClass)} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight">{ev.title}</h2>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {dateLine} · {renderRange(start, end)}
            </div>
            {(isLive || soon || isPast) && (
              <span
                className={cn(
                  "mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isLive || soon ? "bg-pal-orange-bg text-pal-orange-text" : "bg-muted text-muted-foreground",
                )}
              >
                {isLive ? "Happening now" : soon ? `Starts in ${ev.start - NOW_MINUTES} min` : "Ended"}
              </span>
            )}
            {sourceLine && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" /> {sourceLine}
              </div>
            )}
            {ev.isPrivate && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-grid place-items-center text-[11px]">🔒</span>
                Private · others only see "Busy"
              </div>
            )}
          </div>
        </div>

        {/* Join + copy. Join becomes outline when the meeting has ended. */}
        {ev.meet && (
          <div className="mt-4 flex gap-2">
            <Button className="h-11 flex-1 rounded-full" variant={isPast ? "outline" : "secondary"}>
              <Video className="h-4 w-4" /> Join Google Meet
            </Button>
            <GhostIcon label={`Copy link · meet.google.com/${ev.meet}`} className="h-11 w-11">
              <Copy className="h-4 w-4" />
            </GhostIcon>
          </div>
        )}

        {/* People */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-muted-foreground">
            {ev.guests.length} {ev.guests.length === 1 ? "person" : "people"}
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {ev.guests.map((g, i) => {
              const isOrganizer = i === 0;
              const isMe = g === "ml";
              const rsvp = isOrganizer
                ? "Organizer"
                : isMe
                ? response === "accept"
                  ? "Accepted"
                  : response === "decline"
                  ? "Declined"
                  : "Not answered"
                : "Accepted";
              const rsvpClass = rsvp === "Declined"
                ? "text-pal-red-text"
                : rsvp === "Not answered"
                ? "text-muted-foreground"
                : rsvp === "Accepted"
                ? "text-positive"
                : "text-muted-foreground";
              return (
                <div key={g} className="flex items-center gap-3">
                  <Initials person={g} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {isMe ? "Marine Lasserre (you)" : PEOPLE[g].name}
                    </div>
                    {PEOPLE[g].job && (
                      <div className="truncate text-xs text-muted-foreground">{PEOPLE[g].job}</div>
                    )}
                  </div>
                  <span className={cn("shrink-0 text-xs font-medium", rsvpClass)}>{rsvp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {ev.note && (
          <div className="mt-5">
            <div className="text-xs font-semibold text-muted-foreground">Description</div>
            <p className="mt-1 text-sm leading-5">{ev.note}</p>
          </div>
        )}

        {/* Footer lines: reminder + Booking ID (Setmore meetings only). */}
        <div className="mt-6 border-t border-line pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> Reminder 10 minutes before
          </div>
          {ev.source === "setmore" && (
            <div className="mt-1 text-xs text-muted-foreground">
              Booking ID: {ev.id.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* RSVP footer, pinned. Spec: only when someone else organized the meeting. */}
      {!isMine && (
        <div className="border-t border-line bg-background px-4 py-3">
          <div className="mb-1.5 text-xs text-muted-foreground">
            {response === "accept"
              ? "You're going"
              : response === "decline"
              ? "You declined"
              : response === "reschedule"
              ? "You suggested a new time"
              : "Are you going?"}
          </div>
          <div className="flex gap-1">
            <ResponseButton kind="accept" active={response === "accept"} onClick={() => setResponse("accept")} />
            <ResponseButton kind="decline" active={response === "decline"} onClick={() => setResponse("decline")} />
            <ResponseButton kind="reschedule" active={response === "reschedule"} onClick={() => setResponse("reschedule")} />
          </div>
        </div>
      )}
    </aside>
  );
}

// RSVP button: ghost style, 15px icon, chosen one gets a tonal fill (Accept + Reschedule use
// --brand-tonal, Decline uses light red). Red is fixed — it means no, so it doesn't follow the
// brand colour.
function ResponseButton({
  kind,
  active,
  onClick,
}: {
  kind: "accept" | "decline" | "reschedule";
  active: boolean;
  onClick: () => void;
}) {
  const Icon = kind === "accept" ? Check : kind === "decline" ? X : CalendarClock;
  const label = kind === "accept" ? "Accept" : kind === "decline" ? "Decline" : "Reschedule";
  const activeClass =
    kind === "decline"
      ? "bg-pal-red-bg text-pal-red-text"
      : "bg-secondary text-secondary-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-md px-2.5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-fast",
        active ? activeClass : "text-foreground/80 hover:bg-accent",
      )}
    >
      <Icon className="h-[15px] w-[15px]" />
      {label}
    </button>
  );
}

// ---------- Team Day (step 6) --------------------------------------------------
// One column per team member for Friday 2 Oct. Shared meetings appear in each attendee's column.
// Scope decision: 5 people (Marine first), no sideways scroll, no person-colour tinting — the
// SOURCE_PALETTE already differentiates events, and the column header carries the person's name.
const TEAM_DAY_PEOPLE: PersonId[] = ["ml", "ji", "xe", "to", "ju"];

function NewTeamDay() {
  const [selected, setSelected] = useState<string | null>(null);
  const nowY = (NOW_MINUTES - DAY_START * 60) * (HOUR / 60);
  const selectedEvent = EVENTS.find((e) => e.id === selected);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL;
  }, []);
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Headers: one per person (avatar + first name). Marine comes first with "(you)" implied. */}
        <div className="flex border-b border-line">
          <div className="h-dayhead w-gutter shrink-0 border-r border-line" />
          {TEAM_DAY_PEOPLE.map((p) => (
            <div
              key={p}
              className="flex h-dayhead min-w-teamcol flex-1 items-center gap-2 border-l border-line px-3 first:border-l-0"
            >
              <Initials person={p} size={28} />
              <span className="truncate text-sm font-medium">{p === "ml" ? "Marine" : PEOPLE[p].first}</span>
            </div>
          ))}
        </div>
        {/* Grid: hour gutter + one column per person. */}
        <div ref={scrollRef} className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-w-0 flex-1" style={{ height: GRID_HEIGHT }}>
            <div className="relative w-gutter shrink-0 border-r border-line">
              {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
                const hour = DAY_START + i;
                const d = new Date(MONDAY);
                d.setHours(hour, 0, 0, 0);
                return (
                  <div key={hour} className="relative" style={{ height: HOUR }}>
                    <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                      {renderTime(d, { hourOnly: true })}
                    </span>
                  </div>
                );
              })}
              <div
                className="absolute right-1 flex h-5 items-center rounded-md bg-foreground px-1.5 text-[11px] font-semibold text-background"
                style={{ top: nowY - 10 }}
              >
                9:34
              </div>
            </div>
            {TEAM_DAY_PEOPLE.map((p) => {
              const events = EVENTS.filter(
                (e) => e.day === TODAY_IDX && e.guests.includes(p) && !(e.isPrivate && p !== "ml"),
              );
              return (
                <div
                  key={p}
                  className="relative min-w-teamcol flex-1 border-l border-line first:border-l-0"
                >
                  {/* Non-work tint top and bottom */}
                  <div aria-hidden className="absolute left-0 right-0 top-0 bg-canvas-secondary" style={{ height: WORK_START * HOUR }} />
                  <div aria-hidden className="absolute left-0 right-0 bg-canvas-secondary" style={{ top: WORK_END * HOUR, bottom: 0 }} />
                  {Array.from({ length: DAY_END - DAY_START }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-line"
                      style={{ top: (i + 1) * HOUR }}
                    />
                  ))}
                  <div className="absolute left-0 right-0 h-[2px] bg-foreground z-10" style={{ top: nowY }}>
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-foreground" />
                  </div>
                  {events.map((ev) => (
                    <EventCard key={ev.id + "-" + p} ev={ev} onOpen={(id) => setSelected(id)} selectedId={selected} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedEvent && (
        <EventDetailsPanel ev={selectedEvent} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function NewWorkWeek({
  view,
  tzOpen,
  setTzOpen,
  zones,
  setZones,
  ownName,
  setOwnName,
  showZones,
  setShowZones,
}: {
  view: View;
  tzOpen: boolean;
  setTzOpen: (v: boolean) => void;
  zones: ExtraZone[];
  setZones: (z: ExtraZone[]) => void;
  ownName: string;
  setOwnName: (s: string) => void;
  showZones: boolean;
  setShowZones: (v: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const nowY = (NOW_MINUTES - DAY_START * 60) * (HOUR / 60);
  // Spec: Day/Week/Month filter the same Work Week grid; Team Day is a separate view (step 6).
  const dayCols =
    view === "day"
      ? [TODAY_IDX]
      : view === "week"
      ? [0, 1, 2, 3, 4, 5, 6]
      : WORK_DAYS; // "work" | "month" fall through to the working-days range.
  const selectedEvent = EVENTS.find((e) => e.id === selected);
  // Open scrolled to the working hours. The full 24h grid stays reachable by scrolling.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL;
  }, []);

  // "+ EDT" header button triggers the Time zones popover. The ⋯ menu "Show more time zones" item
  // opens the same state, so clicking either anchors the popover here.
  const tzTrigger = (
    <button
      type="button"
      className="flex h-dayhead w-gutter shrink-0 items-center justify-end gap-1 border-r border-line pr-3 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Time zones"
    >
      <Plus aria-hidden className="h-3 w-3 opacity-70" />
      <span>{ownName || "EDT"}</span>
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Day header row — sticky above the scroll area so day labels never leave the viewport. */}
        <div className="flex border-b border-line">
          <TimezonesPopover
            open={tzOpen}
            onOpenChange={setTzOpen}
            trigger={tzTrigger}
            zones={zones}
            setZones={setZones}
            ownName={ownName}
            setOwnName={setOwnName}
            show={showZones}
            setShow={setShowZones}
          />
          {dayCols.map((d) => (
            <div key={d} className="min-w-0 flex-1 border-l border-line first:border-l-0">
              <DayHeading date={dayDate(d)} isToday={d === TODAY_IDX} />
            </div>
          ))}
        </div>
        {/* Scrollable grid (24h, opens at 7AM) */}
        <div ref={scrollRef} className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-w-0 flex-1" style={{ height: GRID_HEIGHT }}>
            {/* Hour column */}
            <div className="relative w-gutter shrink-0 border-r border-line">
              {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
                const hour = DAY_START + i;
                const d = new Date(MONDAY);
                d.setHours(hour, 0, 0, 0);
                return (
                  <div key={hour} className="relative" style={{ height: HOUR }}>
                    <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                      {renderTime(d, { hourOnly: true })}
                    </span>
                  </div>
                );
              })}
              {/* Current time pill, aligned right in the hour gutter */}
              <div
                className="absolute right-1 flex h-5 items-center rounded-md bg-foreground px-1.5 text-[11px] font-semibold text-background"
                style={{ top: nowY - 10 }}
              >
                9:34
              </div>
            </div>
            {/* Day columns. Non-working hours and off-days are tinted so working time stands out. */}
            {dayCols.map((d) => {
              const isWorkDay = WORK_DAYS.includes(d);
              return (
                <div key={d} className="relative min-w-0 flex-1 border-l border-line first:border-l-0">
                  {/* Non-work tint: full column for days off, top & bottom bands for working days.
                      Uses --background-canvas-secondary so it keeps a very subtle hue. */}
                  {/* Non-work tint. Uses --background-canvas-secondary (#fafafa) so day/time
                      dividers stay visible on top; off-days get the same tint across the full column. */}
                  {!isWorkDay && (
                    <div aria-hidden className="absolute inset-0 bg-canvas-secondary" />
                  )}
                  {isWorkDay && (
                    <>
                      <div aria-hidden className="absolute left-0 right-0 top-0 bg-canvas-secondary" style={{ height: WORK_START * HOUR }} />
                      <div aria-hidden className="absolute left-0 right-0 bg-canvas-secondary" style={{ top: WORK_END * HOUR, bottom: 0 }} />
                    </>
                  )}
                  {/* Hour lines */}
                  {Array.from({ length: DAY_END - DAY_START }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-line"
                      style={{ top: (i + 1) * HOUR }}
                    />
                  ))}
                  {/* Current time line on today */}
                  {d === TODAY_IDX && (
                    <div className="absolute left-0 right-0 h-[2px] bg-foreground z-10" style={{ top: nowY }}>
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-foreground" />
                    </div>
                  )}
                  {/* Events */}
                  {EVENTS.filter((e) => e.day === d).map((ev) => (
                    <EventCard key={ev.id} ev={ev} onOpen={(id) => setSelected(id)} selectedId={selected} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Event details side panel */}
      {selectedEvent && (
        <EventDetailsPanel ev={selectedEvent} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ---------- App shell -----------------------------------------------------------

export function NewCalendarApp() {
  // The sidebar collapses to icons under 1024px (laptop/tablet). Day columns always share the rest.
  const collapsed = useNarrow(1024);
  // Lifted so the Calendars chip, ⋯ menu and + EDT header all read/write the same state.
  const [view, setView] = useState<View>("work");
  const [calsChecked, setCalsChecked] = useState<Record<string, boolean>>({
    setmore: true,
    google: true,
    team: true,
  });
  const toggleCal = (k: string) => setCalsChecked((prev) => ({ ...prev, [k]: !prev[k] }));
  const [tzOpen, setTzOpen] = useState(false);
  const [zones, setZones] = useState<ExtraZone[]>([]);
  const [ownName, setOwnName] = useState("");
  const [showZones, setShowZones] = useState(true);
  return (
    <TooltipProvider delayDuration={350}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <NewSidebar collapsed={collapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <NewToolbar
            compact={collapsed}
            view={view}
            setView={setView}
            calsChecked={calsChecked}
            toggleCal={toggleCal}
            tzOpen={tzOpen}
            setTzOpen={setTzOpen}
            zones={zones}
            setZones={setZones}
            ownName={ownName}
            setOwnName={setOwnName}
            showZones={showZones}
            setShowZones={setShowZones}
          />
          {view === "team" ? (
            <NewTeamDay />
          ) : (
            <NewWorkWeek
              view={view}
              tzOpen={tzOpen}
              setTzOpen={setTzOpen}
              zones={zones}
              setZones={setZones}
              ownName={ownName}
              setOwnName={setOwnName}
              showZones={showZones}
              setShowZones={setShowZones}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
