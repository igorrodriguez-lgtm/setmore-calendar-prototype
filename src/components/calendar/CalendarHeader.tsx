"use client";

import { useState } from "react";
import { useKit } from "../kit";
import { CalendarSource, TeamMember, currentUser, team } from "./data";
import { DAY_NAMES, MONTHS, addDays, addMonths, isSameDay, startOfMonth, startOfWeek, weekdayIndex } from "./dates";
import { CalendarNavIcon, ChevronLeft, ChevronRight, ColumnsIcon, ListIcon, MoreIcon, PlusIcon, SearchIcon, ShareIcon } from "./icons";

export type View = "day" | "week" | "month";

type Props = {
  view: View;
  anchor: Date;
  now: Date;
  visibleSources: Set<CalendarSource>;
  visibleStaff: Set<string>;
  onToday: () => void;
  onStep: (direction: -1 | 1) => void;
  onPickDate: (date: Date) => void;
  onViewChange: (view: View) => void;
  onToggleSource: (source: CalendarSource) => void;
  onToggleStaff: (id: string) => void;
  onNew: () => void;
  onShareBookingLink: () => void;
};

const ChevronDown = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function CalendarHeader(props: Props) {
  const { view, anchor, now } = props;
  const { Button, IconButton, Dropdown, DropdownItem } = useKit();

  const title =
    view === "day"
      ? `${DAY_NAMES[weekdayIndex(anchor)]}, ${MONTHS[anchor.getMonth()]} ${anchor.getDate()}`
      : MONTHS[(view === "week" ? addDays(startOfWeek(anchor), 3) : anchor).getMonth()];
  const year = (view === "week" ? addDays(startOfWeek(anchor), 3) : anchor).getFullYear();

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-3 px-6">
      <Button variant="neutralSecondary" onClick={props.onToday}>
        Today
      </Button>
      <IconButton icon={ChevronLeft} label={`Previous ${view}`} onClick={() => props.onStep(-1)} />
      <IconButton icon={ChevronRight} label={`Next ${view}`} onClick={() => props.onStep(1)} />

      <Dropdown
        width={300}
        trigger={
          <button type="button" className="ml-2 flex items-center gap-2 rounded-lg px-2 py-1 text-[28px] hover:bg-neutral-100" aria-haspopup="dialog">
            <span className="font-semibold">{title}</span>
            <span className="text-neutral-500">{year}</span>
            <ChevronDown className="h-5 w-5" />
          </button>
        }
      >
        {(close) => (
          <MiniMonth
            selected={anchor}
            today={now}
            onPick={(date) => {
              props.onPickDate(date);
              close();
            }}
          />
        )}
      </Dropdown>

      <div className="ml-auto flex items-center gap-3">
        <Dropdown
          align="end"
          width={320}
          trigger={
            <Button variant="neutralSecondary" iconEnd={ChevronDown} aria-haspopup="dialog">
              <span className="h-3 w-3 rounded-full bg-[#3d6b52]" />
              Calendars
            </Button>
          }
        >
          {() => <CalendarsPanel {...props} />}
        </Dropdown>

        <Button iconStart={PlusIcon} onClick={props.onNew}>
          New
        </Button>

        <Dropdown
          align="end"
          width={240}
          trigger={
            <span>
              <IconButton icon={MoreIcon} label="More options" variant="neutralSecondary" />
            </span>
          }
        >
          {(close) => (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">View</p>
              {(
                [
                  ["day", "Day", ListIcon],
                  ["week", "Week", ColumnsIcon],
                  ["month", "Month", CalendarNavIcon],
                ] as const
              ).map(([value, label, icon]) => (
                <DropdownItem
                  key={value}
                  icon={icon}
                  isSelected={view === value}
                  onSelect={() => {
                    props.onViewChange(value);
                    close();
                  }}
                >
                  {label}
                </DropdownItem>
              ))}
              <div className="my-1 h-px bg-neutral-200" />
              <DropdownItem
                icon={ShareIcon}
                onSelect={() => {
                  props.onShareBookingLink();
                  close();
                }}
              >
                Share booking link
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

function CalendarsPanel({ visibleSources, visibleStaff, onToggleSource, onToggleStaff }: Props) {
  const { Checkbox, TextInput, Avatar } = useKit();
  const [query, setQuery] = useState("");
  const matches = team.filter((m: TeamMember) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex max-h-[70vh] flex-col gap-3 p-2">
      <p className="text-sm font-semibold">Your calendars</p>
      <Checkbox
        isChecked={visibleStaff.has(currentUser.id)}
        onChange={() => onToggleStaff(currentUser.id)}
        label={
          <span className="flex items-center gap-2">
            <Avatar name={currentUser.name} size="small" /> {currentUser.name}
          </span>
        }
      />
      <Checkbox isChecked={visibleSources.has("setmore")} onChange={() => onToggleSource("setmore")} label="Setmore appointments" />
      <Checkbox isChecked={visibleSources.has("google")} onChange={() => onToggleSource("google")} label={`Google · ${currentUser.email}`} />

      <p className="mt-2 text-sm font-semibold">Team</p>
      <TextInput value={query} onChange={setQuery} placeholder="Search" type="search" adornmentStart={SearchIcon} />
      <div className="-mx-1 flex flex-col gap-2.5 overflow-y-auto px-1 pb-1">
        {matches.map((member) => (
          <Checkbox
            key={member.id}
            isChecked={visibleStaff.has(member.id)}
            onChange={() => onToggleStaff(member.id)}
            label={
              <span className="flex items-center gap-2">
                <Avatar name={member.name} size="small" /> {member.name}
              </span>
            }
          />
        ))}
        {matches.length === 0 && <p className="text-sm text-neutral-500">No one matches “{query}”.</p>}
      </div>
    </div>
  );
}

function MiniMonth({ selected, today, onPick }: { selected: Date; today: Date; onPick: (date: Date) => void }) {
  const { IconButton } = useKit();
  const [month, setMonth] = useState(startOfMonth(selected));
  const first = startOfWeek(month);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="pl-1 font-semibold">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <span className="flex">
          <IconButton icon={ChevronLeft} label="Previous month" size="small" onClick={() => setMonth(addMonths(month, -1))} />
          <IconButton icon={ChevronRight} label="Next month" size="small" onClick={() => setMonth(addMonths(month, 1))} />
        </span>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-neutral-500">
        {DAY_NAMES.map((d) => (
          <span key={d} className="py-1">
            {d[0]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map((date) => {
          const inMonth = date.getMonth() === month.getMonth();
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onPick(date)}
              className={`m-0.5 flex h-8 items-center justify-center rounded-full ${
                isSelected ? "bg-[#3d6b52] font-semibold text-white" : isToday ? "font-semibold text-[#3d6b52]" : inMonth ? "hover:bg-neutral-100" : "text-neutral-400 hover:bg-neutral-100"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
