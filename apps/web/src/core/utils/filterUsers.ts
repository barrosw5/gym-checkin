import type { AdminUser } from "../types/adminUsers";

/** Lower case without accents: "ines" finds "Inês". */
const plain = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Accounts matching what was typed, by name, username or member number. */
export function filterUsers(users: AdminUser[], query: string): AdminUser[] {
  const wanted = plain(query.trim());
  if (!wanted) return users;
  return users.filter((u) => [u.name, u.username, u.room].some((field) => plain(field).includes(wanted)));
}
