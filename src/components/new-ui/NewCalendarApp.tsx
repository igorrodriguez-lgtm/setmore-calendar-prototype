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
  CalendarDays,
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
  Plus,
  Puzzle,
  Settings as SettingsIcon,
  Sparkles,
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
import { formatDayHead, formatRangeTitle, renderRange, renderTime, timeOn, LOCALE, TZ } from "./intl";
import { cn } from "@/lib/utils";

// ---------- Data (made up, matches the boards) ---------------------------------

type PersonId = "ml" | "ji" | "al" | "mi" | "ju" | "xe" | "na" | "ha" | "ud" | "to";
type Palette = "green" | "blue" | "orange";
type Source = "setmore" | "google" | "team";

const PEOPLE: Record<PersonId, { name: string; first: string; palette: Palette }> = {
  ml: { name: "Marine Lasserre", first: "Marine", palette: "orange" },
  ji: { name: "Jillian", first: "Jillian", palette: "green" },
  al: { name: "Alicia", first: "Alicia", palette: "orange" },
  mi: { name: "Michael", first: "Michael", palette: "blue" },
  ju: { name: "Julia", first: "Julia", palette: "orange" },
  xe: { name: "Xenia", first: "Xenia", palette: "orange" },
  na: { name: "Naresh", first: "Naresh", palette: "blue" },
  ha: { name: "Hannah", first: "Hannah", palette: "orange" },
  ud: { name: "Udhaya", first: "Udhaya", palette: "orange" },
  to: { name: "Tomek", first: "Tomek", palette: "blue" },
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
function EventCard({ ev, onOpen }: { ev: EventInput; onOpen: (id: string) => void }) {
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
  const others = ev.guests.filter((g) => g !== "ml");

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
    <HoverCard openDelay={120} closeDelay={60}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onOpen(ev.id)}
          className={cn(
            "absolute left-1 right-1 overflow-hidden rounded-sm text-left transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
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
        side="right"
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
            {(isLive || soon) && (
              <div className="mt-1 text-xs font-medium text-caution">
                {isLive ? "Happening now" : `Starts in ${ev.start - NOW_MINUTES} min`}
              </div>
            )}
          </div>
        </div>
        {ev.meet && (
          <div className="mt-3 flex gap-2">
            <Button className="h-10 flex-1 rounded-full" variant="secondary">
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

function NewToolbar({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex h-toolbar items-center gap-2 border-b border-line bg-background px-4 lg:px-5">
      <Button variant="ghost" className="h-8 rounded-md px-3 text-sm">Today</Button>
      <GhostIcon label="Previous week"><ChevronLeft className="h-4 w-4" /></GhostIcon>
      <GhostIcon label="Next week"><ChevronRight className="h-4 w-4" /></GhostIcon>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex h-9 items-center gap-1 rounded-md px-2 text-lg font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {formatRangeTitle(MONDAY, dayDate(6))}
            <ChevronDown className="h-4 w-4 text-foreground/60" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-menu rounded-xl p-4 shadow-lg">
          {/* TODO: step 4 — month picker (brand circle selected, light hover). */}
          <div className="text-sm text-muted-foreground">Date picker — step 4.</div>
        </PopoverContent>
      </Popover>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" className="h-8 rounded-full border-border px-3 text-sm">
          <CalendarsSwatch className="mr-1" />
          {!compact && "Calendars"}
          <ChevronDown className="h-3.5 w-3.5 text-foreground/60" />
        </Button>
        <Button className="h-8 rounded-full px-4 text-sm">
          <Plus className="h-4 w-4" /> {!compact && "New"}
        </Button>
        <GhostIcon label="More options" className="rounded-full border border-border">
          <MoreHorizontal className="h-4 w-4" />
        </GhostIcon>
      </div>
    </header>
  );
}

function NewWorkWeek() {
  const [selected, setSelected] = useState<string | null>(null);
  const nowY = (NOW_MINUTES - DAY_START * 60) * (HOUR / 60);
  const dayCols = WORK_DAYS;
  const selectedEvent = EVENTS.find((e) => e.id === selected);
  // Open scrolled to the working hours. The full 24h grid stays reachable by scrolling.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL;
  }, []);

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Day header row — sticky above the scroll area so day labels never leave the viewport. */}
        <div className="flex border-b border-line">
          <div className="flex h-dayhead w-gutter shrink-0 items-center justify-end gap-1 border-r border-line pr-3 text-xs text-muted-foreground">
            {/* "+ EDT" on one line (add a time zone + the current label). */}
            <span aria-hidden className="opacity-70">+</span>
            <span>EDT</span>
          </div>
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
                    <EventCard key={ev.id} ev={ev} onOpen={(id) => setSelected(id)} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Event details side panel (step 3 stub) */}
      {selectedEvent && (
        <aside aria-label="Event details" className="w-panel shrink-0 border-l border-line bg-background p-5">
          <div className="flex items-start gap-2">
            <h2 className="flex-1 text-xl font-semibold">{selectedEvent.title}</h2>
            <GhostIcon label="Close" onClick={() => setSelected(null)}>
              <X className="h-4 w-4" />
            </GhostIcon>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "short" }).format(dayDate(selectedEvent.day))}
            {" · "}
            {renderRange(timeOn(dayDate(selectedEvent.day), selectedEvent.start), timeOn(dayDate(selectedEvent.day), selectedEvent.end))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            TODO: step 3 — join / response row / people list / description.
          </div>
        </aside>
      )}
    </div>
  );
}

// ---------- App shell -----------------------------------------------------------

export function NewCalendarApp() {
  // The sidebar collapses to icons under 1024px (laptop/tablet). Day columns always share the rest.
  const collapsed = useNarrow(1024);
  return (
    <TooltipProvider delayDuration={350}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <NewSidebar collapsed={collapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <NewToolbar compact={collapsed} />
          <NewWorkWeek />
        </div>
      </div>
    </TooltipProvider>
  );
}
