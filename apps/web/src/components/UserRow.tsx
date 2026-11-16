import { useState } from "react";
import type { AdminUser } from "../core/types/adminUsers";
import { useTranslation } from "../hooks/useTranslation";

interface UserRowProps {
  user: AdminUser;
  busy: boolean;
  onUpdate: (body: { active?: boolean; room?: string }) => void;
}

/** Admin: one account, with its room and active/inactive toggle. */
export default function UserRow({ user, busy, onUpdate }: UserRowProps) {
  const { t } = useTranslation();
  const [room, setRoom] = useState(user.room);

  return (
    <li
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #e2e8f0",
        opacity: user.active ? 1 : 0.6,
      }}
    >
      <span style={{ flex: "1 1 220px" }}>
        <strong>{user.name}</strong> · {user.username} · {t(`roles.${user.role}`)}
        {!user.active && ` · ${t("users.deactivated")}`}
      </span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate({ room });
        }}
        style={{ display: "flex", gap: "6px" }}
      >
        <label>
          {t("users.roomLabel")}{" "}
          <input value={room} onChange={(e) => setRoom(e.target.value)} size={6} required />
        </label>
        <button type="submit" disabled={busy || room.trim() === user.room}>
          {t("common.save")}
        </button>
      </form>
      <button onClick={() => onUpdate({ active: !user.active })} disabled={busy}>
        {user.active ? t("users.deactivate") : t("users.reactivate")}
      </button>
    </li>
  );
}
