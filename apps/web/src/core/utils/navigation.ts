import type { MessageKey } from "../i18n/types";
import type { Role } from "../types/user";

export type NavIcon = "home" | "desk" | "stats" | "users" | "qr" | "account";

export interface NavItem {
  to: string;
  label: MessageKey;
  icon: NavIcon;
  /** Opens in another tab (the QR screen stays up on the screen students face). */
  newTab?: boolean;
}

const HOME: NavItem = { to: "/dashboard", label: "nav.home", icon: "home" };
const DESK: NavItem = { to: "/reception", label: "nav.desk", icon: "desk" };
const STATS: NavItem = { to: "/stats", label: "nav.stats", icon: "stats" };
const USERS: NavItem = { to: "/admin", label: "nav.users", icon: "users" };
const QR: NavItem = { to: "/reception/screen", label: "nav.qr", icon: "qr", newTab: true };

const ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [HOME, STATS],
  RECEPTION: [DESK, STATS, QR],
  ADMIN: [DESK, STATS, USERS, QR],
};

/** The pages a role can reach: the same rules as the routes in App.tsx. */
export const navItems = (role: Role): NavItem[] => ITEMS[role];

/** Account page: a tab on phones; on a PC the sidebar's user block leads there. */
export const ACCOUNT_ITEM: NavItem = { to: "/account", label: "nav.account", icon: "account" };
