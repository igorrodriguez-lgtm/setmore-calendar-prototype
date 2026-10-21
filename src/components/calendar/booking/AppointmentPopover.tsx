"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GoogleMeetingColorIcon } from "@adaptavant/eds-core";
import { useKit } from "../../kit";
import { useCalendar } from "../state/store";
import { services, staffById } from "../model/mock";
import { describeRepeat } from "../model/recurrence";
import { CalEvent, Occurrence } from "../model/types";
import { formatDayLong, formatDayShort, formatTime, fromKey } from "../model/dates";
import { StaffAvatar } from "../shell/StaffAvatar";
import { Dot } from "./AppointmentForm";

/** Simulated network delay so loading states are visible (decided: ~half a second). */
export function useLoaded(delay = 500, deps: unknown[] = []) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    const id = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loaded;
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-2.5">
      <span className="flex h-5 items-center justify-center text-secondary">{icon}</span>
      <div className="min-w-0 text-body-12">{children}</div>
    </div>
  );
}

export function AppointmentPopover() {
  const { AnchoredPopover } = useKit();
  const store = useCalendar();
  const open = store.openOccurrence;
  // Show the live version of the event (it may have been edited or moved).
  const event = open ? store.events.find((e) => e.id === open.occurrence.event.id) : undefined;
  return (
    <AnchoredPopover anchor={open && event ? open.anchor : null} onClose={store.closePopover} ariaLabel="Appointment" width={300}>
      {open && event && <PopoverBody occurrence={{ ...open.occurrence, event }} />}
    </AnchoredPopover>
  );
}

function PopoverBody({ occurrence }: { occurrence: Occurrence }) {
  const { Tabs, TabList, TabItem, TabContent, IconButton, icons } = useKit();
  const store = useCalendar();
  const { event } = occurrence;
  const isBooking = event.kind !== "event";
  const [tab, setTab] = useState("details");

  return (
    <div className="flex flex-col gap-3 p-4 pt-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-14 font-stronger">Appointment</h2>
        <IconButton aria-label="Close" icon={icons.close} variant="neutralTertiary" size="small" onClick={store.closePopover} />
      </div>
      <Tabs selectedValue={tab} onSelectedValueChange={setTab} size="small">
        <TabList>
          <TabItem value="details">Details</TabItem>
          <TabItem value="history">History</TabItem>
          {isBooking && <TabItem value="payments">Payment(s)</TabItem>}
        </TabList>
        <TabContent value="details" className="mt-3">
          <Details occurrence={occurrence} />
        </TabContent>
        <TabContent value="history" className="mt-3">
          <History event={event} />
        </TabContent>
        {isBooking && (
          <TabContent value="payments" className="mt-3">
            <Payments />
          </TabContent>
        )}
      </Tabs>
    </div>
  );
}

function Details({ occurrence }: { occurrence: Occurrence }) {
  const { Button, IconButton, Placeholder, DropdownMenu, DropdownMenuPopover, DropdownMenuList, DropdownMenuItem, icons } = useKit();
  const store = useCalendar();
  const { event, date, start, end } = occurrence;
  const service = services.find((s) => s.id === event.serviceId);
  const guests = (event.customerIds ?? []).map((id) => store.customers.find((c) => c.id === id)).filter(Boolean);
  const repeat = describeRepeat(event.repeat, fromKey(event.date));
  const remindersLoaded = useLoaded(700, [event.id]);
  const isService = event.kind === "service";

  const edit = () =>
    store.openComposer(
      {
        editingId: event.id,
        tab: event.kind,
        title: event.title,
        color: event.color,
        serviceId: event.serviceId,
        classId: event.classId,
        date,
        start,
        end,
        repeat: event.repeat,
        customerIds: event.customerIds ?? [],
        video: Boolean(event.video),
        location: event.location ?? "",
        notes: event.notes ?? "",
        staffId: event.staffId,
      },
      store.openOccurrence?.anchor ?? null
    );

  return (
    <div className="flex flex-col gap-3.5">
      <Row icon={<Dot color={event.color} />}>
        <p className="text-body-14 font-strong">{service ? service.name : event.title}</p>
        {service && (
          <p className="text-secondary">
            Duration: <span className="text-primary">{service.duration}</span> mins
          </p>
        )}
      </Row>

      <Row icon={<icons.clock size="16" aria-hidden />}>
        <p className="flex flex-wrap gap-x-4">
          <span>{formatDayShort(fromKey(date))}</span>
          <span>{event.allDay ? "All day" : `${formatTime(start)} – ${formatTime(end)}`}</span>
        </p>
        {repeat && <p className="text-body-10 text-secondary">{repeat}</p>}
      </Row>

      {event.video && (
        <Row icon={<GoogleMeetingColorIcon size="16" />}>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p>Google Meet</p>
              <p className="truncate text-body-10 text-secondary">{event.video.url}</p>
            </div>
            <Button size="small" variant="accentPrimary" onClick={() => window.open(event.video!.url, "_blank", "noopener")}>
              Join
            </Button>
          </div>
        </Row>
      )}

      {guests.length > 0 && (
        <Row icon={<icons.user size="16" aria-hidden />}>
          <p>
            {guests.length} guest{guests.length > 1 ? "s" : ""}
          </p>
          {guests.map((g) => (
            <div key={g!.id} className="mt-1.5">
              <p className="font-strong">{g!.name}</p>
              <p className="text-body-10 text-secondary">{g!.email}</p>
              <p className="text-body-10 text-secondary">{g!.phone}</p>
            </div>
          ))}
        </Row>
      )}

      {event.notes && (
        <Row icon={<icons.notes size="16" aria-hidden />}>
          <p>{event.notes}</p>
        </Row>
      )}

      {isService && (
        <Row icon={<icons.reminder size="16" aria-hidden />}>
          <p>Reminder</p>
          {remindersLoaded ? (
            <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-body-10">
              <span>Email</span>
              <span className="text-secondary">Sent 12 hours before</span>
              <span>SMS</span>
              <span className="text-secondary">Sent 2 minutes before</span>
            </div>
          ) : (
            <Placeholder lines={2} />
          )}
        </Row>
      )}

      <Row icon={<StaffAvatar id={event.staffId} size={20} />}>
        <p>{staffById(event.staffId)?.name}</p>
      </Row>

      {!isService && (
        <Row icon={<icons.info size="16" aria-hidden />}>
          <p>Booked from {event.source === "google" ? "Google Calendar" : event.bookedFrom}</p>
          <p className="text-secondary">Booking ID: {event.bookingId}</p>
        </Row>
      )}

      <div className="flex items-center justify-end gap-1">
        <DropdownMenu popoverPlacement="bottom-end">
          {({ triggerProps }) => (
            <>
              <IconButton {...triggerProps} aria-label="More actions" icon={icons.more} variant="neutralTertiary" size="small" />
              <DropdownMenuPopover>
                <DropdownMenuList>
                  <DropdownMenuItem railStart={<icons.duplicate size="16" aria-hidden />} onClick={() => store.duplicateEvent(event.id)}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem railStart={<icons.delete size="16" aria-hidden />} onClick={() => store.setPendingDelete(event.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuList>
              </DropdownMenuPopover>
            </>
          )}
        </DropdownMenu>
        <IconButton aria-label="Edit appointment" icon={icons.edit} variant="neutralTertiary" size="small" onClick={edit} isDisabled={event.source === "google"} />
        {isService && (
          <Button size="small" variant="accentPrimary" onClick={() => store.showToast("Payment recorded")} className="ml-1">
            Collect payment
          </Button>
        )}
      </div>
    </div>
  );
}

function History({ event }: { event: CalEvent }) {
  const { Placeholder } = useKit();
  const loaded = useLoaded(600, [event.id]);
  if (!loaded) return <Placeholder lines={3} avatar />;
  const byDate = new Map<string, typeof event.history>();
  for (const entry of [...event.history].sort((a, b) => b.at.localeCompare(a.at) || b.time - a.time)) {
    byDate.set(entry.at, [...(byDate.get(entry.at) ?? []), entry]);
  }
  return (
    <div className="flex flex-col gap-3">
      {[...byDate].map(([at, entries]) => (
        <section key={at}>
          <h3 className="mb-1.5 text-body-12 font-stronger">{formatDayLong(fromKey(at))}</h3>
          <ul className="flex flex-col gap-2">
            {entries.map((e, i) => (
              <li key={i} className="grid grid-cols-[56px_1fr] gap-2 text-body-12">
                <span className="text-secondary">{formatTime(e.time)}</span>
                <span>
                  {e.actor && <span className="block text-secondary">{e.actor}</span>}
                  <span className="font-strong">{e.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Payments() {
  const { Button } = useKit();
  const store = useCalendar();
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-body-14">No payment history</p>
      <Button size="small" variant="accentPrimary" onClick={() => store.showToast("Payment recorded")}>
        Collect payment
      </Button>
    </div>
  );
}
