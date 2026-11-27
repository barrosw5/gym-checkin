import { Link, Outlet } from "react-router-dom";
import type { MessageKey } from "../core/i18n/types";
import type { Role } from "../core/types/user";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";
import Page from "./ui/Page";

interface RoleGateProps {
  roles: Role[];
  /** Shown to users whose role is not allowed. */
  deniedMessage?: MessageKey;
}

/**
 * Inside ProtectedRoute: which roles may see the pages below. UX only, like
 * the guard above it: the API enforces the same with @Roles().
 */
export default function RoleGate({ roles, deniedMessage = "route.denied" }: RoleGateProps) {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  if (!roles.includes(user.role)) {
    return (
      <Page title={t("route.deniedTitle")}>
        <Card>
          <div className="flex flex-col items-start gap-4">
            <p className="text-ink-2">{t(deniedMessage)}</p>
            <Link to="/" className="inline-flex h-11 items-center font-medium text-accent-ink hover:text-ink">
              {t("route.goToMyHome")}
            </Link>
          </div>
        </Card>
      </Page>
    );
  }

  return <Outlet context={user} />;
}
