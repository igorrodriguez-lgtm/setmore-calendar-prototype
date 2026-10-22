"use client";

import { useKit } from "../../kit";
import type { IconName } from "../../kit/types";
import { useCalendar } from "../state/store";
import { ME } from "../model/mock";
import { StaffAvatar } from "./StaffAvatar";
import { AnywhereWorksMark } from "./AnywhereWorksMark";

const items: { label: string; icon: IconName }[] = [
  { label: "Services", icon: "services" },
  { label: "Connect", icon: "connect" },
  { label: "Customers", icon: "customers" },
  { label: "Updates", icon: "updates" },
  { label: "Academy", icon: "academy" },
  { label: "Settings", icon: "settings" },
];

/** Main navigation, measured from live: 209px wide with 32px rows, or a 48px icon rail when collapsed (always a rail when `isCompact`). */
export function AppNav({ isCompact }: { isCompact: boolean }) {
  const { IconButton, icons } = useKit();
  const store = useCalendar();
  const collapsed = store.isNavCollapsed || isCompact;
  const today = new Date().getDate();
  const notBuilt = (label: string) => store.showToast(`${label} isn't part of this prototype`);
  const shareLink = () => {
    navigator.clipboard?.writeText("https://igor-rodriguez.setmore.com").catch(() => {});
    store.showToast("Booking Page link copied");
  };

  const row = `flex h-8 w-full items-center gap-4 rounded-8px fs-12 text-primary hover:bg-neutral-hover focus-visible:focus-ring ${collapsed ? "justify-center" : "px-2"}`;

  return (
    <nav
      aria-label="Main"
      data-print-hide
      className={`flex shrink-0 flex-col border-r border-secondary bg-canvas pb-[13px] ${collapsed ? "w-[48px] items-center px-1" : "w-[209px] px-1.5"}`}
    >
      <div className={`mb-[15px] flex h-[50px] w-full shrink-0 items-center ${collapsed ? "justify-center" : "justify-between pl-1.5 pr-2"}`}>
        {collapsed ? (
          isCompact ? (
            <AnywhereWorksMark />
          ) : (
            <IconButton aria-label="Expand menu" icon={icons.menu} variant="neutralTertiary" size="small" onClick={() => store.setNavCollapsed(false)} />
          )
        ) : (
          <>
            <span className="flex min-w-0 items-center gap-3.5 whitespace-nowrap text-body-12 font-stronger">
              <AnywhereWorksMark />
              AnywhereWorks
            </span>
            <IconButton aria-label="Collapse menu" icon={icons.chevronLeft} variant="neutralTertiary" size="small" onClick={() => store.setNavCollapsed(true)} />
          </>
        )}
      </div>

      <ul className="flex w-full flex-col gap-1">
        <li>
          <a href="#" aria-current="page" title={collapsed ? "Calendar" : undefined} className={`${row} bg-neutral-active`}>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-4px bg-inverse fs-9 font-stronger text-onPrimary">{today}</span>
            {!collapsed && "Calendar"}
          </a>
        </li>
        {items.map(({ label, icon }) => {
          const Icon = icons[icon];
          return (
            <li key={label}>
              <button type="button" title={collapsed ? label : undefined} onClick={() => notBuilt(label)} className={row}>
                <Icon size="16" aria-hidden />
                {!collapsed && label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex w-full flex-col">
        {collapsed ? (
          <IconButton aria-label="Share your Booking Page link" icon={icons.share} variant="neutralTertiary" size="small" onClick={shareLink} className="self-center" />
        ) : (
          <button
            type="button"
            onClick={shareLink}
            className="flex h-[33px] items-center justify-between whitespace-nowrap rounded-8px border border-secondary pl-[13px] pr-[12px] fs-10 font-strong text-primary hover:bg-neutral-hover focus-visible:focus-ring"
          >
            Share your Booking Page link
            <icons.share size="16" aria-hidden />
          </button>
        )}

        <button type="button" title={collapsed ? "Help & Support" : undefined} onClick={() => notBuilt("Help & Support")} className={`${row} mt-6`}>
          <icons.help size="16" aria-hidden />
          {!collapsed && "Help & Support"}
        </button>

        <div className={`mt-1 flex h-10 items-center gap-3.5 ${collapsed ? "justify-center" : "px-1.5"}`}>
          <StaffAvatar id={ME} size={24} status="available" />
          {!collapsed && <span className="truncate fs-12">Igor Rodriguez</span>}
        </div>
      </div>
    </nav>
  );
}
