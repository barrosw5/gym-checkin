import { Pencil, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import type { AdminUser } from "../core/types/adminUsers";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";
import Button from "./ui/Button";
import { ICON } from "./ui/icon";
import MemberBib from "./ui/MemberBib";

interface UserRowProps {
  user: AdminUser;
  busy: boolean;
  /** Demo account: the actions are shown, but switched off. */
  readOnly: boolean;
  editing: boolean;
  onToggle: () => void;
  onUpdate: (body: { active?: boolean; room?: string }) => void;
}

/** Admin: one account as a table row; "edit" opens its actions underneath. */
export default function UserRow({ user, busy, readOnly, editing, onToggle, onUpdate }: UserRowProps) {
  const { t } = useTranslation();
  const [room, setRoom] = useState(user.room);
  const role = t(`roles.${user.role}`);
  const state = user.active ? t("users.active") : t("users.deactivated");

  return (
    <>
      <tr className={cn("border-t border-line", editing && "bg-raised")}>
        {/* Inactive: a muted name plus the word, never opacity (contrast) */}
        <th scope="row" className="py-3 pr-3 pl-5 text-left font-normal sm:pl-6">
          <span className={cn("block font-medium", user.active ? "text-ink" : "text-ink-3")}>{user.name}</span>
          <span className="block text-sm text-ink-3 wrap-anywhere">{user.username}</span>
          {/* On a phone the role and state columns are folded in here */}
          <span className="block text-sm text-ink-3 md:hidden">
            {role} · {state}
          </span>
        </th>
        <td className="py-3 pr-3">
          {user.role === "STUDENT" ? <MemberBib room={user.room} /> : <span className="text-sm text-ink-3">{user.room}</span>}
        </td>
        <td className="hidden py-3 pr-3 text-ink-2 md:table-cell">{role}</td>
        <td className="hidden py-3 pr-3 md:table-cell">
          <span className="flex items-center gap-2 text-ink-2">
            <span aria-hidden="true" className={cn("size-2 rounded-full", user.active ? "bg-data" : "bg-line-strong")} />
            {state}
          </span>
        </td>
        <td className="py-3 pr-5 text-right sm:pr-6">
          <Button size="sm" variant="ghost" onClick={onToggle} aria-expanded={editing}>
            <Pencil {...ICON} />
            {/* Icon only on narrow phones; the name stays for screen readers */}
            <span className="sr-only sm:not-sr-only">{t("users.edit")}</span>
          </Button>
        </td>
      </tr>
      {editing && (
        <tr className="bg-raised">
          <td colSpan={5} className="px-5 pb-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate({ room });
                }}
                className="flex items-end gap-2"
              >
                <label className="flex flex-col gap-1 text-sm text-ink-2">
                  {t("users.roomLabel")}
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                    disabled={readOnly}
                    // 16 px on phones: below that, iOS zooms the page in on focus
                    className="h-11 w-28 rounded-lg bg-surface px-3 text-base text-ink tabular-nums ring-1 ring-inset ring-line-strong focus:ring-2 focus:ring-accent-ink focus:outline-none disabled:cursor-not-allowed disabled:text-ink-3 sm:text-sm"
                  />
                </label>
                <Button variant="secondary" type="submit" disabled={readOnly || busy || room.trim() === user.room}>
                  {t("common.save")}
                </Button>
              </form>
              <Button
                variant={user.active ? "danger" : "secondary"}
                disabled={readOnly || busy}
                onClick={() => onUpdate({ active: !user.active })}
              >
                {user.active ? <UserX {...ICON} /> : <UserCheck {...ICON} />}
                {user.active ? t("users.deactivate") : t("users.reactivate")}
              </Button>
            </div>
            {readOnly && <p className="mt-3 text-sm text-ink-2">{t("users.demoDisabled")}</p>}
          </td>
        </tr>
      )}
    </>
  );
}
