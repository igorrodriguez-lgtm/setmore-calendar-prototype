"use client";

import { useKit } from "../kit";
import { CalendarEvent, currentUser, eventColors, team } from "./data";
import { DAY_NAMES, MONTHS, fromKey, rangeLabel, weekdayIndex } from "./dates";
import { ClockIcon, GoogleIcon, TrashIcon, UserIcon, VideoIcon } from "./icons";

type Props = {
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
  onJoin: () => void;
};

export function EventDetails({ event, onEdit, onDelete, onJoin }: Props) {
  const { Button, Avatar } = useKit();
  const date = fromKey(event.date);
  const staff = event.staffId === currentUser.id ? currentUser.name : team.find((m) => m.id === event.staffId)?.name;
  const isGoogle = event.source === "google";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${eventColors[event.color].dot}`} />
        <div>
          <h3 className="text-lg font-semibold leading-snug">{event.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-neutral-600">
            <ClockIcon className="h-4 w-4" />
            {DAY_NAMES[weekdayIndex(date)]}, {MONTHS[date.getMonth()]} {date.getDate()} · {rangeLabel(event.start, event.end)}
          </p>
        </div>
      </div>

      {event.customer && (
        <div className="flex items-center gap-3 text-sm">
          <Avatar name={event.customer} size="small" />
          <span>
            <span className="block font-medium">{event.customer}</span>
            <span className="text-neutral-500">Customer</span>
          </span>
        </div>
      )}
      {staff && (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <UserIcon className="h-4 w-4" /> With {staff}
        </p>
      )}
      {isGoogle && (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <GoogleIcon className="h-4 w-4" /> From Google Calendar
        </p>
      )}
      {event.notes && <p className="rounded-lg bg-neutral-50 p-2.5 text-sm text-neutral-700">{event.notes}</p>}

      <div className="mt-1 flex flex-wrap gap-2">
        {event.video && (
          <Button size="small" iconStart={VideoIcon} onClick={onJoin}>
            Join video
          </Button>
        )}
        <Button size="small" variant="neutralSecondary" onClick={onEdit} isDisabled={isGoogle}>
          Edit
        </Button>
        <Button size="small" variant="criticalTertiary" iconStart={TrashIcon} onClick={onDelete} isDisabled={isGoogle}>
          Delete
        </Button>
      </div>
      {isGoogle && <p className="text-xs text-neutral-500">Google events are edited in Google Calendar.</p>}
    </div>
  );
}
