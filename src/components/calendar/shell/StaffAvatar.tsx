"use client";

import { useKit } from "../../kit";
import { staffById } from "../model/mock";
import type { AvatarSize } from "../../kit/types";

/** A staff member's avatar (initials until real photos exist). */
export function StaffAvatar({ id, size = 24, status }: { id: string; size?: number; status?: "available" }) {
  const { Avatar } = useKit();
  const avatar = <Avatar name={staffById(id)?.name ?? "?"} size={String(size) as AvatarSize} />;
  if (!status) return avatar;
  // EDS Avatar's own status badge leaks an internal prop to the DOM (React warning in eds-core
  // 1.48.0), so the dot is drawn here with the EDS status colour instead.
  return (
    <span className="relative inline-flex shrink-0">
      {avatar}
      <span
        aria-label="Available"
        className="absolute -bottom-px -right-px rounded-full border-2 border-[var(--status-border)] bg-[var(--status-available)]"
        style={{ width: Math.max(8, size * 0.38), height: Math.max(8, size * 0.38) }}
      />
    </span>
  );
}
