"use client";

import { SetmoreColorIcon } from "@adaptavant/eds-core";
import { useKit } from "../../kit";
import type { IconName } from "../../kit/types";
import { useCalendar } from "../state/store";
import { ME } from "../model/mock";
import { StaffAvatar } from "./StaffAvatar";

const items: { label: string; icon: IconName }[] = [
  { label: "Services", icon: "services" },
  { label: "Connect", icon: "connect" },
  { label: "Customers", icon: "customers" },
  { label: "Updates", icon: "updates" },
  { label: "Academy", icon: "academy" },
  { label: "Settings", icon: "settings" },
];

/** Main navigation: full width, or a 38px icon rail when collapsed (always a rail when `isCompact`). */
export function AppNav({ isCompact }: { isCompact: boolean }) {
  const { IconButton, Tooltip, icons } = useKit();
  const store = useCalendar();
  const collapsed = store.isNavCollapsed || isCompact;
  const today = new Date().getDate();
  const notBuilt = (label: string) => store.showToast(`${label} isn't part of this prototype`);
  const shareLink = () => {
    navigator.clipboard?.writeText("https://igor-rodriguez.setmore.com").catch(() => {});
    store.showToast("Booking Page link copied");
  };

  const row = `flex h-[26px] w-full items-center gap-2.5 rounded-6px text-body-12 text-primary hover:bg-neutral-hover focus-visible:focus-ring ${collapsed ? "justify-center" : "px-2"}`;

  return (
    <nav
      aria-label="Main"
      data-print-hide
      className={`flex shrink-0 flex-col border-r border-secondary bg-canvas py-2.5 ${collapsed ? "w-[38px] items-center px-1" : "w-[153px] px-1.5"}`}
    >
      <div className={`mb-4 flex h-6 w-full items-center ${collapsed ? "justify-center" : "justify-between pl-1.5"}`}>
        {collapsed ? (
          isCompact ? (
            <SetmoreColorIcon size="20" />
          ) : (
            <IconButton aria-label="Expand menu" icon={icons.menu} variant="neutralTertiary" size="small" onClick={() => store.setNavCollapsed(false)} />
          )
        ) : (
          <>
            <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-body-12 font-stronger">
              <SetmoreColorIcon size="20" />
              AnywhereWorks
            </span>
            <IconButton aria-label="Collapse menu" icon={icons.chevronLeft} variant="neutralTertiary" size="small" onClick={() => store.setNavCollapsed(true)} />
          </>
        )}
      </div>

      <ul className="flex w-full flex-col gap-px">
        <li>
          <a href="#" aria-current="page" title={collapsed ? "Calendar" : undefined} className={`${row} bg-neutral-active font-strong`}>
            <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-4px bg-inverse fs-8 font-stronger text-onPrimary">{today}</span>
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

      <div className="mt-auto flex w-full flex-col gap-1">
        {collapsed ? (
          <IconButton aria-label="Share your Booking Page link" icon={icons.upload} variant="neutralTertiary" size="small" onClick={shareLink} className="self-center" />
        ) : (
          <button
            type="button"
            onClick={shareLink}
            className="flex items-center justify-between rounded-8px border border-secondary px-2.5 py-2 text-body-10 font-strong text-primary hover:bg-neutral-hover focus-visible:focus-ring"
          >
            Share your Booking Page link
            <icons.upload size="16" aria-hidden />
          </button>
        )}

        <Tooltip content="Time clock isn't part of this prototype" placement="top">
          {({ triggerProps }) => (
            <span {...triggerProps} tabIndex={0} className={`${row} mt-3 cursor-default text-disabled hover:bg-canvas`}>
              <icons.timer size="16" aria-hidden />
              {!collapsed && "00:00:00"}
            </span>
          )}
        </Tooltip>

        <button type="button" title={collapsed ? "Help & Support" : undefined} onClick={() => notBuilt("Help & Support")} className={row}>
          <icons.help size="16" aria-hidden />
          {!collapsed && "Help & Support"}
        </button>

        <div className={`flex h-8 items-center gap-2 ${collapsed ? "justify-center" : "px-1.5"}`}>
          <StaffAvatar id={ME} size={24} status="available" />
          {!collapsed && <span className="truncate text-body-12">Igor Rodriguez</span>}
        </div>
      </div>
    </nav>
  );
}
