import { UserCheck, UserX } from "lucide-react";
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
  onUpdate: (body: { active?: boolean; room?: string }) => void;
}

/** Admin: one account, with its room and the active/inactive toggle. */
export default function UserRow({ user, busy, onUpdate }: UserRowProps) {
  const { t } = useTranslation();
  const [room, setRoom] = useState(user.room);

  return (
    // Inactive: a muted name plus the "deactivated" word, never opacity (it would
    // drop every text in the row below WCAG AA contrast)
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
      <div className="min-w-48 flex-1">
        <p className={cn("flex items-center gap-2 font-medium", user.active ? "text-ink" : "text-ink-3")}>
          {user.name}
          <MemberBib room={user.room} />
        </p>
        {/* Usernames have no spaces: let a long one break instead of overflowing on a phone */}
        <p className="mt-0.5 text-sm text-ink-3 wrap-anywhere">
          {user.username} · {t(`roles.${user.role}`)}
          {!user.active && ` · ${t("users.deactivated")}`}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate({ room });
        }}
        className="flex items-center gap-2"
      >
        {/* The label wraps the input: a tap on its 4 px padding focuses it too (44 px in all) */}
        <label className="py-1">
          <span className="sr-only">{t("users.roomLabel")}</span>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
            // 16 px on phones: below that, iOS zooms the page in on focus
            className="block h-9 w-20 rounded-lg bg-surface px-2 text-base tabular-nums sm:text-sm ring-1 ring-inset ring-line-strong focus:outline-none focus:ring-2 focus:ring-accent-ink"
          />
        </label>
        <Button size="sm" variant="secondary" type="submit" disabled={busy || room.trim() === user.room}>
          {t("common.save")}
        </Button>
      </form>
      <Button size="sm" variant={user.active ? "danger" : "secondary"} disabled={busy} onClick={() => onUpdate({ active: !user.active })}>
        {user.active ? <UserX {...ICON} /> : <UserCheck {...ICON} />}
        {user.active ? t("users.deactivate") : t("users.reactivate")}
      </Button>
    </li>
  );
}
