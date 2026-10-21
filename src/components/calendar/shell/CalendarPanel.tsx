"use client";

import { useState } from "react";
import { useKit } from "../../kit";
import { useCalendar } from "../state/store";
import { ME, staff } from "../model/mock";
import { StaffAvatar } from "./StaffAvatar";
import { GoogleG } from "./GoogleG";

/** "Your calendars" and "Team", under the panel label in the header row. */
export function CalendarPanel({ asDrawer = false }: { asDrawer?: boolean }) {
  const { Field, SearchInput, Checkbox, icons } = useKit();
  const store = useCalendar();
  const [query, setQuery] = useState("");
  const multi = store.view === "day" || store.view === "team";
  const team = staff.filter((s) => s.id !== ME && s.name.toLowerCase().includes(query.trim().toLowerCase()));

  const personRow = (id: string, name: string) => {
    const avatar = (
      <span className="flex min-w-0 items-center gap-2">
        <StaffAvatar id={id} size={20} />
        <span className={`block truncate ${multi ? "max-w-[96px]" : ""}`}>{name}</span>
      </span>
    );
    if (multi) {
      return (
        <div key={id} className="flex h-[26px] items-center rounded-6px px-1.5 hover:bg-neutral-hover">
          <Checkbox label={avatar} checked={store.checkedStaff.includes(id)} onChange={() => store.toggleChecked(id)} className="w-full" />
        </div>
      );
    }
    const isSelected = store.selectedStaff === id;
    return (
      <button
        key={id}
        type="button"
        aria-pressed={isSelected}
        onClick={() => store.selectStaff(id)}
        className={`flex h-[26px] w-full min-w-0 items-center rounded-6px px-1.5 text-left text-body-12 focus-visible:focus-ring ${
          isSelected ? "bg-neutral-active" : "hover:bg-neutral-hover"
        }`}
      >
        {avatar}
      </button>
    );
  };

  return (
    <aside
      aria-label="Calendars"
      data-print-hide
      className={`flex min-h-0 shrink-0 flex-col bg-canvas ${asDrawer ? "h-full w-[260px] px-3 pt-3" : "w-[160px] pl-2.5 pr-1"}`}
    >
      <h2 className="px-1.5 pb-1 text-body-12 font-stronger">Your calendars</h2>
      {personRow(ME, "Igor Rodriguez")}
      <div className="flex h-[26px] items-center px-1.5 opacity-50">
        <Checkbox
          isDisabled
          checked
          label={
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-secondary">
                <GoogleG className="h-3 w-3" />
              </span>
              <span className="block max-w-[92px] truncate">igor.rodriguez@anywhere.co</span>
            </span>
          }
          className="w-full"
        />
      </div>
      <button
        type="button"
        onClick={() => store.showToast("Connecting calendars isn't part of this prototype")}
        className="flex h-[26px] items-center gap-1.5 rounded-6px px-2 text-body-12 text-secondary hover:bg-neutral-hover"
      >
        <icons.add size="16" aria-hidden />
        Connect calendar
      </button>

      <h2 className="mt-3 px-1.5 pb-1.5 text-body-12 font-stronger">Team</h2>
      <div className="mb-1 pr-1.5">
        <Field label="Search team" labelVisibility="hidden">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} placeholder="Search" />
        </Field>
      </div>
      <div className="eds-scroll -mr-1 min-h-0 flex-1 overflow-y-auto pb-2 pr-1">
        {team.map((s) => personRow(s.id, s.name))}
        {team.length === 0 && <p className="px-2 py-2 text-body-12 text-secondary">No one matches “{query}”</p>}
      </div>
    </aside>
  );
}
