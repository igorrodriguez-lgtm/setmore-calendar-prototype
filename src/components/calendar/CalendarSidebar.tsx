"use client";

import { useState } from "react";
import { useKit } from "../kit";
import { currentUser, team } from "./data";
import { GoogleIcon, PanelIcon, PlusIcon, SearchIcon } from "./icons";

type Props = {
  selectedStaff: string;
  showGoogle: boolean;
  onSelectStaff: (id: string) => void;
  onToggleGoogle: (show: boolean) => void;
  onConnectCalendar: () => void;
  onCollapse: () => void;
};

export function CalendarSidebar({ selectedStaff, showGoogle, onSelectStaff, onToggleGoogle, onConnectCalendar, onCollapse }: Props) {
  const { Avatar, Checkbox, TextInput } = useKit();
  const [query, setQuery] = useState("");
  const matches = team.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

  const personRow = (id: string, name: string) => (
    <button
      key={id}
      type="button"
      onClick={() => onSelectStaff(id)}
      aria-pressed={selectedStaff === id}
      className={`flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] ${
        selectedStaff === id ? "bg-neutral-100" : "hover:bg-neutral-50"
      }`}
    >
      <Avatar name={name} />
      <span className="truncate">{name}</span>
    </button>
  );

  return (
    <aside className="flex w-[290px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onCollapse}
        className="flex h-[52px] shrink-0 items-center gap-2 px-5 text-lg text-neutral-500 hover:text-neutral-800"
        title="Hide calendar panel"
      >
        <PanelIcon className="h-5 w-5" />
        Your calendar
      </button>

      <div className="flex min-h-0 flex-1 flex-col px-4">
        <p className="px-1 pb-2 pt-3 font-semibold">Your calendars</p>
        {personRow(currentUser.id, currentUser.name)}

        <div className="flex h-12 min-w-0 items-center px-1">
          <Checkbox
            isChecked={showGoogle}
            onChange={onToggleGoogle}
            label={
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <GoogleIcon className="h-4 w-4" />
                </span>
                <span className="truncate">{currentUser.email}</span>
              </span>
            }
          />
        </div>

        <button
          type="button"
          onClick={onConnectCalendar}
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-[15px] text-neutral-700 hover:bg-neutral-50"
        >
          <PlusIcon className="h-4 w-4" />
          Connect calendar
        </button>

        <p className="px-1 pb-3 pt-6 font-semibold">Team</p>
        <TextInput value={query} onChange={setQuery} placeholder="Search" type="search" adornmentStart={SearchIcon} />

        <div className="-mx-1 mt-2 min-h-0 flex-1 overflow-y-auto px-1 pb-3">
          {matches.map((m) => personRow(m.id, m.name))}
          {matches.length === 0 && <p className="px-2 py-3 text-sm text-neutral-500">No one matches “{query}”.</p>}
        </div>
      </div>
    </aside>
  );
}
