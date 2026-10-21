"use client";

import { useKit } from "../kit";
import { currentUser } from "./data";
import {
  CalendarNavIcon,
  CapIcon,
  ChatIcon,
  ChevronLeft,
  ChevronRight,
  GearIcon,
  HelpIcon,
  ListIcon,
  LogoIcon,
  NewsIcon,
  ShareIcon,
  SmileIcon,
} from "./icons";

const items = [
  { label: "Calendar", icon: CalendarNavIcon },
  { label: "Services", icon: ListIcon },
  { label: "Connect", icon: ChatIcon },
  { label: "Customers", icon: SmileIcon },
  { label: "Updates", icon: NewsIcon },
  { label: "Academy", icon: CapIcon },
  { label: "Settings", icon: GearIcon },
];

type Props = {
  isCollapsed: boolean;
  onToggle: () => void;
  onShareBookingLink: () => void;
  onNotBuilt: (feature: string) => void;
};

export function AppNav({ isCollapsed, onToggle, onShareBookingLink, onNotBuilt }: Props) {
  const { Avatar, IconButton } = useKit();
  const today = new Date().getDate();

  return (
    <nav
      className={`flex shrink-0 flex-col border-r border-neutral-200 bg-white py-3 transition-[width] ${isCollapsed ? "w-[68px] px-2" : "w-[266px] px-3"}`}
    >
      <div className={`mb-5 flex h-10 items-center ${isCollapsed ? "justify-center" : "justify-between pl-1"}`}>
        {!isCollapsed && (
          <span className="flex items-center gap-2.5 font-semibold">
            <LogoIcon className="h-7 w-7 text-[#2f5f4a]" />
            AnywhereWorks
          </span>
        )}
        <IconButton icon={isCollapsed ? ChevronRight : ChevronLeft} label={isCollapsed ? "Expand menu" : "Collapse menu"} size="small" onClick={onToggle} />
      </div>

      <ul className="flex flex-col gap-1">
        {items.map(({ label, icon: Icon }, i) => {
          const isActive = i === 0;
          return (
            <li key={label}>
              <button
                type="button"
                title={isCollapsed ? label : undefined}
                onClick={() => !isActive && onNotBuilt(label)}
                className={`flex h-11 w-full items-center gap-3 rounded-xl text-[15px] ${isCollapsed ? "justify-center" : "px-3"} ${
                  isActive ? "bg-neutral-100 font-medium" : "text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                {isActive ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-[10px] font-bold text-white">{today}</span>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {!isCollapsed && label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-2">
        {isCollapsed ? (
          <IconButton icon={ShareIcon} label="Share your Booking Page link" onClick={onShareBookingLink} />
        ) : (
          <button
            type="button"
            onClick={onShareBookingLink}
            className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-sm hover:bg-neutral-50"
          >
            Share your Booking Page link
            <ShareIcon className="h-5 w-5" />
          </button>
        )}

        <div className="h-6" />

        {[
          { label: "Help & Support", icon: HelpIcon },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            title={isCollapsed ? label : undefined}
            onClick={() => onNotBuilt(label)}
            className={`flex h-11 items-center gap-3 rounded-xl text-[15px] hover:bg-neutral-50 ${isCollapsed ? "justify-center" : "px-3"}`}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && label}
          </button>
        ))}

        <div className={`flex items-center gap-3 py-1 ${isCollapsed ? "justify-center" : "px-2"}`}>
          <span className="relative">
            <Avatar name={currentUser.name} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#3d6b52]" />
          </span>
          {!isCollapsed && <span className="text-[15px] font-medium">{currentUser.name}</span>}
        </div>
      </div>
    </nav>
  );
}
