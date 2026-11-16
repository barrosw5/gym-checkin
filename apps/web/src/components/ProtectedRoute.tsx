import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import type { MessageKey } from "../core/i18n/types";
import type { Role } from "../core/types/user";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";

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
    return <p style={{ textAlign: "center" }}>{t("common.loading")}</p>;
  }

  if (state.status === "error") {
    return (
      <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
        <p>{t("route.serverDown")}</p>
        <button onClick={retry} style={{ padding: "10px" }}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    // Remember where the user was going, to send them back after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(state.user.role)) {
    return (
      <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>{t("route.deniedTitle")}</h2>
        <p>{t(deniedMessage)}</p>
        <Link to="/">{t("route.goToMyHome")}</Link>
      </div>
    );
  }

  // Temporary password (imported account): choose a new one before anything
  // else. UX only: the old password is random and was only seen by the admin
  if (state.user.mustChangePassword && location.pathname !== "/password") {
    return <Navigate to="/password" replace />;
  }

  return <Outlet context={state.user} />;
}
