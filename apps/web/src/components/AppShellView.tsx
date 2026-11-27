import { ChartColumn, ConciergeBell, ExternalLink, House, QrCode, User as UserIcon, Users } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { User } from "../core/types/user";
import { cn } from "../core/utils/cn";
import { ACCOUNT_ITEM, navItems, type NavIcon } from "../core/utils/navigation";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import ThemeToggle from "./ThemeToggle";
import Brand from "./ui/Brand";
import { ICON } from "./ui/icon";
import MemberBib from "./ui/MemberBib";

export interface AppShellViewProps {
  user: User;
  /** The log out button (it has its own hook). */
  logout: ReactNode;
  /** The current page. */
  children: ReactNode;
}

const ICONS: Record<NavIcon, typeof House> = {
  home: House,
  desk: ConciergeBell,
  stats: ChartColumn,
  users: Users,
  qr: QrCode,
  account: UserIcon,
};

/**
 * Around every page of a logged-in user: a sidebar on a PC, a top bar and a
 * bottom navigation on phones (thumb reach, where members use the app).
 */
export default function AppShellView({ user, logout, children }: AppShellViewProps) {
  const { t } = useTranslation();
  const items = navItems(user.role);
  const linkTarget = (newTab?: boolean) => (newTab ? "_blank" : undefined);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
        <Brand />
        <nav aria-label={t("nav.label")}>
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    target={linkTarget(item.newTab)}
                    className={({ isActive }) =>
                      cn(
                        "group flex h-11 items-center gap-2.5 rounded-lg px-3 text-[15px] transition-colors duration-150",
                        isActive ? "bg-raised font-medium text-ink" : "text-ink-2 hover:bg-raised hover:text-ink",
                      )
                    }
                  >
                    <Icon {...ICON} className="shrink-0 text-ink-3 group-aria-[current=page]:text-accent-ink" />
                    {t(item.label)}
                    {item.newTab && <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" className="ml-auto text-ink-3" />}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-2">
            <LanguagePicker />
            <ThemeToggle />
          </div>
          <NavLink
            to={ACCOUNT_ITEM.to}
            className={({ isActive }) =>
              cn("flex flex-col items-start gap-1.5 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-raised", isActive && "bg-raised")
            }
          >
            <span className="max-w-full truncate text-sm font-medium text-ink">{user.name}</span>
            {/* Member numbers exist for members only: staff show their role */}
            {user.role === "STUDENT" ? (
              <MemberBib room={user.room} />
            ) : (
              <span className="text-sm text-ink-3">{t(`roles.${user.role}`)}</span>
            )}
          </NavLink>
          {logout}
        </div>
      </aside>

      {/* The bottom padding keeps the last content above the fixed bar */}
      <div className="min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="flex h-14 items-center border-b border-line bg-surface px-4 lg:hidden">
          <Brand />
        </header>
        {children}
      </div>

      <nav
        aria-label={t("nav.label")}
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {[...items, ACCOUNT_ITEM].map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.to} className="min-w-0 flex-1">
                <NavLink
                  to={item.to}
                  end
                  target={linkTarget(item.newTab)}
                  className={({ isActive }) =>
                    cn("group flex h-16 flex-col items-center justify-center gap-1 text-[11px]", isActive ? "font-medium text-ink" : "text-ink-2")
                  }
                >
                  <span className="grid h-7 w-12 place-items-center rounded-full transition-colors duration-150 group-aria-[current=page]:bg-accent group-aria-[current=page]:text-on-accent">
                    <Icon {...ICON} />
                  </span>
                  <span className="max-w-full truncate px-0.5">{t(item.label)}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
