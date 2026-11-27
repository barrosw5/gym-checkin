import { KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { User } from "../core/types/user";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import ThemeToggle from "./ThemeToggle";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";
import MemberBib from "./ui/MemberBib";

export interface AccountViewProps {
  user: User;
  /** The log out button (it has its own hook). */
  logout: ReactNode;
}

/** Who is logged in, the app's preferences, password and log out. */
export default function AccountView({ user, logout }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-medium text-ink">{user.name}</p>
            <p className="text-sm text-ink-3 wrap-anywhere">
              {user.username} · {t(`roles.${user.role}`)}
            </p>
          </div>
          {user.role === "STUDENT" && <MemberBib room={user.room} />}
        </div>
      </Card>

      <Card title={t("account.preferences")}>
        <dl className="flex flex-col gap-3">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <dt className="text-ink-2">{t("language.label")}</dt>
            <dd>
              <LanguagePicker />
            </dd>
          </div>
          <div className="flex min-h-11 items-center justify-between gap-4">
            <dt className="text-ink-2">{t("account.theme")}</dt>
            <dd>
              <ThemeToggle />
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          {user.isDemo ? (
            <p className="text-sm text-ink-3">{t("password.demo")}</p>
          ) : (
            <Link to="/password" className="inline-flex h-11 items-center gap-2 self-start rounded-lg font-medium text-accent-ink hover:text-ink">
              <KeyRound {...ICON} />
              {t("auth.changePassword")}
            </Link>
          )}
          {logout}
        </div>
      </Card>
    </div>
  );
}
