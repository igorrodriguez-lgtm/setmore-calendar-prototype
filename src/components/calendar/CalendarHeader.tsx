"use client";

import { useKit } from "../kit";
import { MiniMonth } from "./MiniMonth";
import { DAY_NAMES, MONTHS, addDays, startOfWeek, weekdayIndex } from "./dates";
import {
  CalendarNavIcon,
  ChevronLeft,
  ChevronRight,
  ColumnsIcon,
  ListIcon,
  MoreIcon,
  PanelIcon,
  PlusIcon,
  ShareIcon,
} from "./icons";

export type View = "day" | "week" | "month";

type Props = {
  view: View;
  anchor: Date;
  now: Date;
  isPanelOpen: boolean;
  onOpenPanel: () => void;
  onToday: () => void;
  onStep: (direction: -1 | 1) => void;
  onPickDate: (date: Date) => void;
  onViewChange: (view: View) => void;
  onNew: () => void;
  onShareBookingLink: () => void;
  onShowShortcuts: () => void;
};

const views = [
  ["day", "Day", ListIcon],
  ["week", "Week", ColumnsIcon],
  ["month", "Month", CalendarNavIcon],
] as const;

export function CalendarHeader(props: Props) {
  const { view, anchor, now } = props;
  const { Button, IconButton, Dropdown, DropdownItem } = useKit();

  // A week that spans two months is named after the month most of it falls in.
  const titleDate = view === "week" ? addDays(startOfWeek(anchor), 3) : anchor;
  const title = view === "day" ? `${DAY_NAMES[weekdayIndex(anchor)]}, ${MONTHS[anchor.getMonth()]} ${anchor.getDate()}` : MONTHS[titleDate.getMonth()];

  return (
    <header className="grid h-[52px] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
      <div>
        {!props.isPanelOpen && (
          <button
            type="button"
            onClick={props.onOpenPanel}
            className="flex items-center gap-2 text-lg text-neutral-500 hover:text-neutral-800"
            title="Show calendar panel"
          >
            <PanelIcon className="h-5 w-5" />
            Your calendar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          width={300}
          trigger={
            <button type="button" className="rounded-lg px-2 py-1 text-xl font-semibold hover:bg-neutral-100" aria-haspopup="dialog">
              {title} <span className="text-neutral-500">{titleDate.getFullYear()}</span>
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
        <IconButton icon={ChevronLeft} label={`Previous ${view}`} size="small" onClick={() => props.onStep(-1)} />
        <IconButton icon={ChevronRight} label={`Next ${view}`} size="small" onClick={() => props.onStep(1)} />
        <Button variant="neutralTertiary" size="small" onClick={props.onToday}>
          Today
        </Button>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Dropdown
          align="end"
          width={200}
          trigger={
            <span>
              <IconButton icon={ColumnsIcon} label="Change view" />
            </span>
          }
        >
          {(close) =>
            views.map(([value, label, icon]) => (
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
            ))
          }
        </Dropdown>
        <IconButton icon={PlusIcon} label="New appointment" onClick={props.onNew} />
        <Dropdown
          align="end"
          width={230}
          trigger={
            <span>
              <IconButton icon={MoreIcon} label="More options" />
            </span>
          }
        >
          {(close) => (
            <>
              <DropdownItem
                icon={ShareIcon}
                onSelect={() => {
                  props.onShareBookingLink();
                  close();
                }}
              >
                Copy booking page link
              </DropdownItem>
              <DropdownItem
                icon={ListIcon}
                onSelect={() => {
                  props.onShowShortcuts();
                  close();
                }}
              >
                Keyboard shortcuts
              </DropdownItem>
            </>
          )}
        </Dropdown>
        <span className="ml-2">
          <Button variant="neutralSecondaryIntense" iconStart={ShareIcon} onClick={props.onShareBookingLink}>
            Share
          </Button>
        </span>
      </div>
    </header>
  );
}
