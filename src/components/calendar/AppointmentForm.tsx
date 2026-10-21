"use client";

import { useEffect, useState } from "react";
import { useKit } from "../kit";
import { CalendarEvent, EventColor, currentUser, services, team } from "./data";

export type Draft = Omit<CalendarEvent, "id" | "source"> & { id?: string };

type Props = {
  draft: Draft | null;
  onClose: () => void;
  onSave: (draft: Draft) => void;
};

const durations = [15, 30, 45, 60, 90, 120];
const colors: { value: EventColor; label: string }[] = [
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
];

const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const fromTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function AppointmentForm({ draft, onClose, onSave }: Props) {
  const { Modal, Field, TextInput, TextArea, Select, Checkbox, Button } = useKit();
  const [form, setForm] = useState<Draft | null>(draft);

  useEffect(() => setForm(draft), [draft]);
  if (!form) return null;

  const duration = form.end - form.start;
  const set = (patch: Partial<Draft>) => setForm({ ...form, ...patch });
  const isEditing = Boolean(form.id);
  const canSave = form.title.trim().length > 0;

  return (
    <Modal
      isOpen={draft !== null}
      onClose={onClose}
      title={isEditing ? "Edit appointment" : "New appointment"}
      footer={
        <>
          <Button variant="neutralSecondary" onClick={onClose}>
            Cancel
          </Button>
          <Button isDisabled={!canSave} onClick={() => onSave(form)}>
            {isEditing ? "Save" : "Book appointment"}
          </Button>
        </>
      }
    >
      <Field label="Service">
        <Select
          value={services.find((s) => s.name === form.title)?.id ?? "custom"}
          onChange={(id) => {
            const service = services.find((s) => s.id === id);
            if (service) set({ title: service.name, end: form.start + service.duration });
          }}
          options={[...services.map((s) => ({ value: s.id, label: `${s.name} · ${s.duration} min` })), { value: "custom", label: "Custom title" }]}
        />
      </Field>
      <Field label="Title">
        <TextInput value={form.title} onChange={(title) => set({ title })} placeholder="Appointment title" autoFocus />
      </Field>
      <Field label="Customer">
        <TextInput value={form.customer ?? ""} onChange={(customer) => set({ customer })} placeholder="Customer name" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Date">
          <TextInput type="date" value={form.date} onChange={(date) => date && set({ date })} />
        </Field>
        <Field label="Start">
          <TextInput
            type="time"
            value={toTime(form.start)}
            onChange={(t) => {
              const start = fromTime(t);
              set({ start, end: Math.min(start + duration, 24 * 60) });
            }}
          />
        </Field>
        <Field label="Duration">
          <Select
            value={String(duration)}
            onChange={(d) => set({ end: Math.min(form.start + Number(d), 24 * 60) })}
            options={(durations.includes(duration) ? durations : [...durations, duration].sort((a, b) => a - b)).map((d) => ({
              value: String(d),
              label: d < 60 ? `${d} min` : `${d / 60} hr`,
            }))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Staff">
          <Select
            value={form.staffId ?? currentUser.id}
            onChange={(staffId) => set({ staffId })}
            options={[{ value: currentUser.id, label: currentUser.name }, ...team.map((m) => ({ value: m.id, label: m.name }))]}
          />
        </Field>
        <Field label="Colour">
          <Select value={form.color} onChange={(c) => set({ color: c as EventColor })} options={colors} />
        </Field>
      </div>
      <Checkbox isChecked={Boolean(form.video)} onChange={(video) => set({ video })} label="Add a video meeting link" />
      <Field label="Notes">
        <TextArea value={form.notes ?? ""} onChange={(notes) => set({ notes })} placeholder="Anything the team should know" rows={2} />
      </Field>
    </Modal>
  );
}
