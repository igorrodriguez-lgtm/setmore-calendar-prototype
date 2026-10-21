"use client";

import { useMemo, useState } from "react";
import { useKit } from "../../kit";
import type { IconName } from "../../kit/types";
import { useCalendar, visibleStaffIds } from "../state/store";
import { services, staffById } from "../model/mock";
import { expand } from "../model/recurrence";
import { View } from "../model/types";
import { DAY_SHORT, MONTHS, MONTH_SHORT, addDays, addMonths, formatDayShort, formatRange, startOfMonth, startOfWeek, weekdayIndex } from "../model/dates";

const views: { value: View; label: string; key: string; icon: IconName }[] = [
  { value: "day", label: "Day", key: "D", icon: "day" },
  { value: "week", label: "Week", key: "W", icon: "week" },
  { value: "month", label: "Month", key: "M", icon: "month" },
  { value: "agenda", label: "Agenda", key: "A", icon: "agenda" },
  { value: "team", label: "Team", key: "T", icon: "team" },
];

const stepLabel: Record<View, string> = { day: "day", team: "day", week: "week", agenda: "week", month: "month" };

/** The date range the header and booking stats talk about. */
export function useVisibleRange() {
  const { view, anchorDate } = useCalendar();
  return useMemo(() => {
    if (view === "month") {
      const first = startOfMonth(anchorDate);
      return { from: first, to: new Date(first.getFullYear(), first.getMonth() + 1, 0) };
    }
    if (view === "week" || view === "agenda") {
      const monday = startOfWeek(anchorDate);
      return { from: monday, to: addDays(monday, 6) };
    }
    return { from: anchorDate, to: anchorDate };
  }, [view, anchorDate]);
}

export function PanelLabel() {
  const { icons } = useKit();
  const store = useCalendar();
  const ids = visibleStaffIds(store);
  const label = ids.length > 1 ? `${ids.length} calendars` : ids[0] === "igor" ? "Your calendar" : `${staffById(ids[0])?.name.split(" ")[0]}'s calendar`;
  return (
    <button
      type="button"
      onClick={() => store.setPanelOpen(!store.isPanelOpen)}
      aria-expanded={store.isPanelOpen}
      aria-label={`${store.isPanelOpen ? "Hide" : "Show"} calendars panel (${label})`}
      className="flex h-7 items-center gap-1.5 rounded-full px-2 text-body-14 text-tertiary hover:bg-neutral-hover hover:text-primary focus-visible:focus-ring"
    >
      <icons.sidebar size="16" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function Header() {
  const kit = useKit();
  const { IconButton, Button, Tooltip, DatePicker, Calendar, InlineField, icons } = kit;
  const store = useCalendar();
  const { view, anchorDate } = store;
  const now = new Date();

  const title =
    view === "day" || view === "team" ? (
      <>
        <span className="font-stronger">{`${DAY_SHORT[weekdayIndex(anchorDate)]} ${anchorDate.getDate()} ${MONTH_SHORT[anchorDate.getMonth()]}`}</span>{" "}
        <span className="text-secondary">{anchorDate.getFullYear()}</span>
      </>
    ) : view === "agenda" ? (
      <>
        <span className="font-stronger">{MONTH_SHORT[addMonths(anchorDate, -19).getMonth()]}</span> <span className="text-secondary">{addMonths(anchorDate, -19).getFullYear()}</span>
        {" - "}
        <span className="font-stronger">{MONTH_SHORT[addMonths(anchorDate, 17).getMonth()]}</span> <span className="text-secondary">{addMonths(anchorDate, 17).getFullYear()}</span>
      </>
    ) : (
      <>
        <span className="font-stronger">{MONTHS[(view === "week" ? addDays(startOfWeek(anchorDate), 3) : anchorDate).getMonth()]}</span>{" "}
        <span className="text-secondary">{(view === "week" ? addDays(startOfWeek(anchorDate), 3) : anchorDate).getFullYear()}</span>
      </>
    );

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <InlineField label="Go to date" labelVisibility="hidden">
        <DatePicker
          placeholder="Choose a date"
          trigger={({ triggerProps }) => (
            <button {...triggerProps} type="button" className="whitespace-nowrap rounded-full px-2.5 py-1 text-body-14 text-primary hover:bg-neutral-hover focus-visible:focus-ring">
              {title}
            </button>
          )}
          calendar={({ close }) => (
            <Calendar
              value={anchorDate}
              weekStartsOn={1}
              hasTodayButton={false}
              onValueChange={(d?: Date) => {
                if (d) store.setAnchorDate(d);
                close(d);
              }}
            />
          )}
        />
        </InlineField>
        <IconButton aria-label={`Previous ${stepLabel[view]}`} icon={icons.chevronLeft} variant="neutralTertiary" size="small" onClick={() => store.step(-1)} />
        <IconButton aria-label={`Next ${stepLabel[view]}`} icon={icons.chevronRight} variant="neutralTertiary" size="small" onClick={() => store.step(1)} />
        <Tooltip content={formatDayShort(now)} placement="bottom">
          {({ triggerProps }) => (
            <Button {...triggerProps} variant="neutralTertiary" size="small" onClick={store.goToday}>
              Today
            </Button>
          )}
        </Tooltip>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <ViewMenu />
        <CreateMenu />
        <MoreMenu />
        <ShareMenu />
      </div>
    </div>
  );
}

function ViewMenu() {
  const { DropdownMenu, DropdownMenuPopover, DropdownMenuList, DropdownMenuItem, IconButton, Toggle, icons } = useKit();
  const store = useCalendar();
  const current = views.find((v) => v.value === store.view)!;
  return (
    <DropdownMenu popoverPlacement="bottom-end" popoverMaxWidth={220}>
      {({ triggerProps }) => (
        <>
          <IconButton {...triggerProps} aria-label={`View: ${current.label}`} icon={icons[current.icon]} variant="neutralTertiary" size="small" />
          <DropdownMenuPopover>
            <DropdownMenuList>
              {views.map((v) => {
                const Icon = icons[v.icon];
                return (
                  <DropdownMenuItem
                    key={v.value}
                    onClick={() => store.setView(v.value)}
                    railStart={
                      <span className="flex items-center gap-1.5">
                        <span className="flex w-4 justify-center">{store.view === v.value && <icons.check size="16" aria-hidden />}</span>
                        <Icon size="16" aria-hidden />
                      </span>
                    }
                    railEnd={<span className="text-body-12 text-secondary">{v.key}</span>}
                  >
                    {v.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuList>
            <div className="px-2 pb-1.5 pt-1">
              <Toggle label="Hide weekends" checked={store.hideWeekends} onChange={(e) => store.setHideWeekends(e.target.checked)} togglePosition="end" />
            </div>
          </DropdownMenuPopover>
        </>
      )}
    </DropdownMenu>
  );
}

function CreateMenu() {
  const { DropdownMenu, DropdownMenuPopover, DropdownMenuList, DropdownMenuItem, IconButton, icons } = useKit();
  const store = useCalendar();
  return (
    <DropdownMenu popoverPlacement="bottom-end">
      {({ triggerProps }) => (
        <>
          <IconButton {...triggerProps} aria-label="Create" icon={icons.add} variant="neutralTertiary" size="small" />
          <DropdownMenuPopover>
            <DropdownMenuList>
              <DropdownMenuItem railStart={<icons.createBooking size="16" aria-hidden />} onClick={() => store.openComposer({})}>
                New booking
              </DropdownMenuItem>
              <DropdownMenuItem railStart={<icons.addCustomer size="16" aria-hidden />} onClick={() => store.setAddingCustomer(true)}>
                Add customer
              </DropdownMenuItem>
            </DropdownMenuList>
          </DropdownMenuPopover>
        </>
      )}
    </DropdownMenu>
  );
}

function MoreMenu() {
  const { DropdownMenu, DropdownMenuPopover, DropdownMenuList, DropdownMenuItem, IconButton, icons } = useKit();
  const store = useCalendar();
  const [showStats, setShowStats] = useState(false);
  const { from, to } = useVisibleRange();

  const stats = useMemo(() => {
    const ids = visibleStaffIds(store);
    const bookings = expand(store.events.filter((e) => ids.includes(e.staffId) && e.kind !== "event"), from, to);
    const projected = bookings.reduce((sum, o) => sum + (services.find((s) => s.id === o.event.serviceId)?.price ?? 0), 0);
    return { count: bookings.length, projected };
  }, [store, from, to]);

  return (
    <DropdownMenu popoverPlacement="bottom-end" popoverMaxWidth={240}>
      {({ triggerProps }) => (
        <>
          <IconButton {...triggerProps} aria-label="More options" icon={icons.more} variant="neutralTertiary" size="small" />
          <DropdownMenuPopover>
            <DropdownMenuList>
              <DropdownMenuItem onClick={() => window.print()}>Print calendar</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowStats((s) => !s);
                  return false;
                }}
                railEnd={<icons.chevronDown size="16" aria-hidden className={showStats ? "rotate-180" : ""} />}
              >
                View booking stats
              </DropdownMenuItem>
            </DropdownMenuList>
            {showStats && (
              <div className="w-[216px] px-2 pb-2 pt-1 text-center" aria-live="polite">
                <p className="text-body-12 text-secondary">{formatRange(from, to)}</p>
                <div className="mt-1 grid grid-cols-3">
                  {[
                    [String(stats.count), "Bookings"],
                    ["£0.00", "Confirmed"],
                    [`£${stats.projected.toFixed(2)}`, "Projected"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-body-14 font-stronger">{value}</p>
                      <p className="text-body-10 text-secondary">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DropdownMenuPopover>
        </>
      )}
    </DropdownMenu>
  );
}

export function useShareActions() {
  const store = useCalendar();
  return {
    bookingPage: () => {
      navigator.clipboard?.writeText("https://igor-rodriguez.setmore.com").catch(() => {});
      store.showToast("Booking Page link copied");
    },
    oneTimeMeeting: () => {
      navigator.clipboard?.writeText(`https://igor-rodriguez.setmore.com/meet/${Date.now().toString(36)}`).catch(() => {});
      store.showToast("One-time meeting link copied");
    },
  };
}

function ShareMenu() {
  const { DropdownMenu, DropdownMenuPopover, DropdownMenuList, DropdownMenuItem, Button, icons } = useKit();
  const share = useShareActions();
  return (
    <DropdownMenu popoverPlacement="bottom-end">
      {({ triggerProps }) => (
        <>
          <Button {...triggerProps} variant="neutralSecondaryIntense" size="small" iconStart={icons.share} className="ml-1.5">
            Share
          </Button>
          <DropdownMenuPopover>
            <DropdownMenuList>
              <DropdownMenuItem railStart={<icons.link size="16" aria-hidden />} railEnd={<span className="text-body-12 text-secondary">⇧C</span>} onClick={share.bookingPage}>
                Booking Page
              </DropdownMenuItem>
              <DropdownMenuItem railStart={<icons.calendar size="16" aria-hidden />} railEnd={<span className="text-body-12 text-secondary">⇧A</span>} onClick={share.oneTimeMeeting}>
                One-time Meeting
              </DropdownMenuItem>
            </DropdownMenuList>
          </DropdownMenuPopover>
        </>
      )}
    </DropdownMenu>
  );
}
