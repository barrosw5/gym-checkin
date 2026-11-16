import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import type { MessageKey } from "../core/i18n/types";
import type { Role } from "../core/types/user";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import PageLayout from "./ui/PageLayout";

interface ProtectedRouteProps {
  /** Roles allowed in. Omit to allow any logged-in user. */
  roles?: Role[];
  /** Shown to logged-in users whose role is not allowed. */
  deniedMessage?: MessageKey;
}

/**
 * Route guard for the SPA. UX only: it decides what to *show*.
 * The real protection is the API (JwtAuthGuard + RolesGuard), because
 * anyone can change the JS running in their own browser.
 */
export default function ProtectedRoute({ roles, deniedMessage = "route.denied" }: ProtectedRouteProps) {
  const { state, retry } = useCurrentUser();
  const location = useLocation();
  const { t } = useTranslation();

  if (state.status === "loading") {
    return (
      <PageLayout>
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      </PageLayout>
    );
  }

  if (state.status === "error") {
    return (
      <PageLayout>
        <Card>
          <div className="flex flex-col gap-4">
            <Alert tone="error">{t("route.serverDown")}</Alert>
            <Button variant="secondary" onClick={retry}>
              {t("common.retry")}
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  if (state.status === "unauthenticated") {
    // Remember where the user was going, to send them back after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(state.user.role)) {
    return (
      <PageLayout title={t("route.deniedTitle")}>
        <Card>
          <div className="flex flex-col items-start gap-4">
            <p className="text-slate-600">{t(deniedMessage)}</p>
            <Link to="/" className="inline-flex h-11 items-center font-medium text-navy-700 hover:text-navy-900">
              {t("route.goToMyHome")}
            </Link>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // Temporary password (imported account): choose a new one before anything
  // else. UX only: the old password is random and was only seen by the admin
  if (state.user.mustChangePassword && location.pathname !== "/password") {
    return <Navigate to="/password" replace />;
  }

  return <Outlet context={state.user} />;
}
