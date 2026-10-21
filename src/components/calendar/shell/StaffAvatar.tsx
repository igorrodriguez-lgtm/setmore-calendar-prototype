"use client";

import { useKit } from "../../kit";
import { staffById } from "../model/mock";
import type { AvatarSize } from "../../kit/types";

/** A staff member's avatar (initials until real photos exist). */
export function StaffAvatar({ id, size = 24, status }: { id: string; size?: number; status?: "available" }) {
  const { Avatar } = useKit();
  return <Avatar name={staffById(id)?.name ?? "?"} size={String(size) as AvatarSize} status={status} />;
}
