"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useKit } from "../../kit";
import type { ComboboxOption } from "../../kit/types";
import { useCalendar, type Draft } from "../state/store";
import { classes, eventSwatches, services, staffById } from "../model/mock";
import { repeatOptions } from "../model/recurrence";
import { EventKind, PaletteColor, Repeat } from "../model/types";
import { formatDayShort, fromKey, isSameDay, toKey } from "../model/dates";
import { StaffAvatar } from "../shell/StaffAvatar";

/** Strong palette colours, used for swatches and dots (EDS --palette-*-background-active). */
export const swatchHex: Record<PaletteColor, string> = {
  blue: "#5eb0f8",
  red: "#da3a00",
  orange: "#ff8a35",
  yellow: "#ffc700",
  violet: "#512fb1",
  "dark-blue": "#007cea",
  maroon: "#8e4c1b",
  gray: "#c0c0c0",
  "dark-green": "#007178",
  green: "#3ead85",
};

export function Dot({ color, size = 12 }: { color?: PaletteColor; size?: number }) {
  return <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: color ? swatchHex[color] : "var(--background-neutral-tertiary)" }} />;
}

const at = (date: string, minutes: number) => {
  const d = fromKey(date);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
};

/** The "Appointment" form: Service, Class and Event tabs. Shared by the slot popover and the centred modal. */
export function AppointmentForm({ showHeader }: { showHeader: boolean }) {
  const { Tabs, TabList, TabItem, TabContent, IconButton, Button, icons } = useKit();
  const store = useCalendar();
  const draft = store.composer!.draft;
  const set = store.updateDraft;

  const switchTab = (tab: string) => {
    const next = tab as EventKind;
    if (next === "event") set({ tab: next, end: Math.min(draft.start + 60, 24 * 60) });
    else set({ tab: next, end: draft.start + 30 });
  };

  const canCreate = draft.tab === "service" ? Boolean(draft.serviceId) : draft.tab === "class" ? Boolean(draft.classId) : true;

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 pt-3.5">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-heading-14 font-stronger">{draft.editingId ? "Edit appointment" : "Appointment"}</h2>
          <IconButton aria-label="Close" icon={icons.close} variant="neutralTertiary" size="small" onClick={store.closeComposer} />
        </div>
      )}
      <Tabs selectedValue={draft.tab} onSelectedValueChange={switchTab} size="small">
        <TabList>
          <TabItem value="service">Service</TabItem>
          <TabItem value="class">Class</TabItem>
          <TabItem value="event">Event</TabItem>
        </TabList>
        {(["service", "class", "event"] as const).map((tab) => (
          <TabContent key={tab} value={tab} className="mt-3 flex flex-col gap-3">
            {tab === "event" ? <EventNameRow draft={draft} /> : <BookableRow kind={tab} draft={draft} />}
            <WhenRow draft={draft} />
            <GuestsRow draft={draft} />
            <LinkRow draft={draft} />
            <NotesRow draft={draft} />
            <Row icon={<StaffAvatar id={draft.staffId} size={20} />}>
              <span className="text-body-12">{staffById(draft.staffId)?.name}</span>
            </Row>
          </TabContent>
        ))}
      </Tabs>
      <div className="flex justify-end">
        <Button size="small" onClick={store.saveDraft} isDisabled={!canCreate}>
          {draft.editingId ? "Save" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-2.5">
      <span className="flex h-8 items-center justify-center text-secondary">{icon}</span>
      <div className="flex min-w-0 flex-col justify-center gap-1 [min-height:32px]">{children}</div>
    </div>
  );
}

type BookableOption = ComboboxOption & { color: PaletteColor; subtitle: string; duration: number };

/** Service or class picker: coloured dot + name + duration (and seats for classes). */
function BookableRow({ kind, draft }: { kind: "service" | "class"; draft: Draft }) {
  const { Field, Combobox, ComboboxTextInput, ComboboxPopover, ComboboxListbox, ComboboxItem } = useKit();
  const store = useCalendar();
  const [term, setTerm] = useState("");
  const options: BookableOption[] = useMemo(
    () =>
      kind === "service"
        ? services.map((s) => ({ id: s.id, value: s.name, color: s.color, duration: s.duration, subtitle: `${s.duration} mins` }))
        : classes.map((c) => ({ id: c.id, value: c.name, color: c.color, duration: c.duration, subtitle: `${c.seats} seats · ${c.duration} mins` })),
    [kind]
  );
  const filtered = options.filter((o) => o.value.toLowerCase().includes(term.trim().toLowerCase()));
  const selectedId = kind === "service" ? draft.serviceId : draft.classId;
  const selected = options.find((o) => o.id === selectedId);

  return (
    <Row icon={<Dot color={selected?.color} />}>
      <Field label={kind === "service" ? "Service" : "Class"} labelVisibility="hidden">
        <Combobox
          options={filtered}
          selectedKey="value"
          selectedOption={selected}
          onSelectionChange={(o: BookableOption | undefined) => {
            setTerm("");
            if (!o) return;
            store.updateDraft({
              ...(kind === "service" ? { serviceId: o.id } : { classId: o.id }),
              color: o.color,
              end: Math.min(draft.start + o.duration, 24 * 60),
            });
          }}
          inputValue={term || selected?.value || ""}
          onInputChange={setTerm}
          onClose={() => setTerm("")}
          menuTrigger="focus"
          popoverMatchReferenceWidth
        >
          <ComboboxTextInput placeholder={kind === "service" ? "Select a service" : "Select a class"} autoFocus={!draft.editingId} />
          <ComboboxPopover>
            <ComboboxListbox options={filtered} noResultsFallback={<span className="text-body-12 text-secondary">No matching results</span>}>
              {(item: BookableOption) => (
                <ComboboxItem option={item}>
                  <span className="flex items-center gap-2.5">
                    <Dot color={item.color} size={14} />
                    <span className="min-w-0">
                      <span className="block truncate text-body-12">{item.value}</span>
                      <span className="block text-body-10 text-secondary">{item.subtitle}</span>
                    </span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxListbox>
          </ComboboxPopover>
        </Combobox>
      </Field>
    </Row>
  );
}

/** Event tab: colour picker (5×2 swatches) and the event name. */
function EventNameRow({ draft }: { draft: Draft }) {
  const { Field, TextInput, DropdownMenu, DropdownMenuPopover, ColorSwatches, icons } = useKit();
  const store = useCalendar();
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
      <DropdownMenu popoverMaxWidth={200}>
        {({ triggerProps }) => (
          <>
            <button
              {...(triggerProps as Record<string, unknown>)}
              type="button"
              aria-label="Event colour"
              className="flex h-8 items-center gap-0.5 rounded-full px-1 hover:bg-neutral-hover focus-visible:focus-ring"
            >
              <Dot color={draft.color} size={14} />
              <icons.chevronDown size="16" aria-hidden className="h-3 w-3 text-secondary" />
            </button>
            <DropdownMenuPopover>
              <div className="p-2">
                <ColorSwatches
                  colors={eventSwatches.map((c) => swatchHex[c])}
                  value={swatchHex[draft.color]}
                  onChange={(hex: string) => {
                    const color = eventSwatches.find((c) => swatchHex[c] === hex);
                    if (color) store.updateDraft({ color });
                  }}
                  size="20"
                  rows={2}
                  ariaLabelPrefix="Event colour"
                />
              </div>
            </DropdownMenuPopover>
          </>
        )}
      </DropdownMenu>
      <Field label="Event name" labelVisibility="hidden">
        <TextInput value={draft.title} onChange={(e) => store.updateDraft({ title: e.target.value })} placeholder="Event name" autoFocus={!draft.editingId} />
      </Field>
    </div>
  );
}

/** Date chip, start – end times, and the repeat dropdown. */
function WhenRow({ draft }: { draft: Draft }) {
  const { DatePicker, Calendar, TimePicker, InlineField, SelectMenu, SelectMenuTrigger, SelectMenuPopover, SelectMenuListbox, SelectMenuItem, icons } = useKit();
  const store = useCalendar();
  const date = fromKey(draft.date);
  const options = repeatOptions(date);
  const now = new Date();
  // Start times run from the current half hour onwards when booking today, like Setmore.
  const minStart = isSameDay(date, now) && !draft.editingId ? at(draft.date, Math.floor((now.getHours() * 60 + now.getMinutes()) / 30) * 30 - 1) : undefined;

  return (
    <Row icon={<icons.clock size="16" aria-hidden />}>
      <div className="flex flex-nowrap items-center gap-x-0.5">
        <InlineField label="Date" labelVisibility="hidden" className="shrink-0">
        <DatePicker
          placeholder="Date"
          trigger={({ triggerProps }) => (
            <button {...triggerProps} type="button" className="h-7 rounded-6px border border-[transparent] px-1.5 text-body-12 hover:border-input focus-visible:focus-ring">
              {formatDayShort(date)}
            </button>
          )}
          calendar={({ close }) => (
            <Calendar
              value={date}
              weekStartsOn={1}
              hasTodayButton={false}
              onValueChange={(d?: Date) => {
                if (d) store.updateDraft({ date: toKey(d) });
                close(d);
              }}
            />
          )}
        />
        </InlineField>
        {/* EDS TimePicker reads defaultValue once, so a key remounts it when the value changes elsewhere. */}
        <TimePicker
          key={`start-${draft.date}-${draft.start}`}
          label="Start time"
          variant="subtle"
          interval={30}
          defaultValue={at(draft.date, draft.start)}
          minValue={minStart}
          onSelect={({ newOption }) => {
            if (!newOption) return;
            const start = newOption.dateObject.getHours() * 60 + newOption.dateObject.getMinutes();
            store.updateDraft({ start, end: Math.min(start + (draft.end - draft.start), 24 * 60) });
          }}
        />
        <span aria-hidden>–</span>
        <TimePicker
          key={`end-${draft.date}-${draft.start}-${draft.end}`}
          label="End time"
          variant="subtle"
          interval={30}
          defaultValue={at(draft.date, draft.end % (24 * 60))}
          minValue={at(draft.date, draft.start)}
          onSelect={({ newOption }) => {
            if (!newOption) return;
            store.updateDraft({ end: newOption.dateObject.getHours() * 60 + newOption.dateObject.getMinutes() });
          }}
        />
      </div>
      <InlineField label="Repeat" labelVisibility="hidden" className="w-fit">
        <SelectMenu popoverMaxWidth={240}>
          <SelectMenuTrigger>{options.find((o) => o.value === draft.repeat.type)?.label}</SelectMenuTrigger>
          <SelectMenuPopover>
            <SelectMenuListbox>
              {options.map((o) => (
                <SelectMenuItem
                  key={o.value}
                  isSelected={draft.repeat.type === o.value}
                  onClick={() => {
                    const repeat: Repeat = o.value === "custom" ? { type: "custom", every: 2, unit: "week" } : ({ type: o.value } as Repeat);
                    store.updateDraft({ repeat });
                  }}
                >
                  {o.value === "custom" ? "Custom (every 2 weeks)" : o.label}
                </SelectMenuItem>
              ))}
            </SelectMenuListbox>
          </SelectMenuPopover>
        </SelectMenu>
      </InlineField>
    </Row>
  );
}

type CustomerOption = ComboboxOption & { email: string };

function GuestsRow({ draft }: { draft: Draft }) {
  const { Field, Combobox, ComboboxTextInput, ComboboxPopover, ComboboxListbox, ComboboxItem, IconButton, icons } = useKit();
  const store = useCalendar();
  const [term, setTerm] = useState("");
  const options: CustomerOption[] = store.customers
    .filter((c) => !draft.customerIds.includes(c.id) && c.name.toLowerCase().includes(term.trim().toLowerCase()))
    .slice(0, 8)
    .map((c) => ({ id: c.id, value: c.name, email: c.email }));

  return (
    <Row icon={<icons.user size="16" aria-hidden />}>
      {draft.customerIds.map((id) => {
        const c = store.customers.find((x) => x.id === id);
        return (
          <div key={id} className="flex items-center gap-2 text-body-12">
            <span className="min-w-0 flex-1 truncate">{c?.name}</span>
            <IconButton aria-label={`Remove ${c?.name}`} icon={icons.close} variant="neutralTertiary" size="small" onClick={() => store.updateDraft({ customerIds: draft.customerIds.filter((x) => x !== id) })} />
          </div>
        );
      })}
      <Field label="Add guests" labelVisibility="hidden">
        <Combobox
          options={options}
          selectedKey="value"
          selectedOption={undefined}
          onSelectionChange={(o: CustomerOption | undefined) => {
            setTerm("");
            if (o) store.updateDraft({ customerIds: [...draft.customerIds, o.id] });
          }}
          inputValue={term}
          onInputChange={setTerm}
          onClose={() => setTerm("")}
          menuTrigger="focus"
          popoverMatchReferenceWidth
        >
          <ComboboxTextInput placeholder="Add guest(s)" />
          <ComboboxPopover>
            <ComboboxListbox options={options} noResultsFallback={<span className="text-body-12 text-secondary">No matching customers</span>}>
              {(item: CustomerOption) => (
                <ComboboxItem option={item}>
                  <span className="block truncate text-body-12">{item.value}</span>
                  <span className="block truncate text-body-10 text-secondary">{item.email}</span>
                </ComboboxItem>
              )}
            </ComboboxListbox>
          </ComboboxPopover>
        </Combobox>
      </Field>
    </Row>
  );
}

/** Video link for bookings; free-text location or link for events. */
function LinkRow({ draft }: { draft: Draft }) {
  const { InlineField, TextInput, Button, icons } = useKit();
  const store = useCalendar();
  if (draft.tab === "event") {
    return (
      <Row icon={<icons.location size="16" aria-hidden />}>
        <InlineField label="Location or video link" labelVisibility="hidden">
          <TextInput value={draft.location} onChange={(e) => store.updateDraft({ location: e.target.value })} placeholder="Add location or video link" />
        </InlineField>
      </Row>
    );
  }
  return (
    <Row icon={<icons.video size="16" aria-hidden />}>
      {draft.video ? (
        <div className="flex items-center gap-2 text-body-12">
          <span className="flex-1">Google Meet link will be added</span>
          <Button variant="neutralTertiary" size="small" onClick={() => store.updateDraft({ video: false })}>
            Remove
          </Button>
        </div>
      ) : (
        <Button variant="neutralTertiary" size="small" onClick={() => store.updateDraft({ video: true })} className="self-start">
          Add video link
        </Button>
      )}
    </Row>
  );
}

function NotesRow({ draft }: { draft: Draft }) {
  const { InlineField, Textarea, icons } = useKit();
  const store = useCalendar();
  return (
    <Row icon={<icons.notes size="16" aria-hidden />}>
      <InlineField label="Notes" labelVisibility="hidden">
        <Textarea value={draft.notes} onChange={(e) => store.updateDraft({ notes: e.target.value })} placeholder="Notes to provider and guest(s)" row={1} />
      </InlineField>
    </Row>
  );
}

/** Popover beside the clicked slot, or a centred modal from "+ New booking". */
export function AppointmentComposer() {
  const { AnchoredPopover, Modal, ModalHeader, ModalContent } = useKit();
  const store = useCalendar();
  if (!store.composer) return null;
  if (store.composer.anchor) {
    return (
      <AnchoredPopover anchor={store.composer.anchor} onClose={store.closeComposer} ariaLabel="Appointment" width={320}>
        <AppointmentForm showHeader />
      </AnchoredPopover>
    );
  }
  return (
    <Modal open onClose={store.closeComposer} titleId="appointment-title" size={340} closeButtonProps={{ label: "Close", onClick: store.closeComposer }}>
      <ModalHeader>
        <h2 id="appointment-title" className="text-heading-14 font-stronger">
          {store.composer.draft.editingId ? "Edit appointment" : "Appointment"}
        </h2>
      </ModalHeader>
      <ModalContent>
        <AppointmentForm showHeader={false} />
      </ModalContent>
    </Modal>
  );
}
