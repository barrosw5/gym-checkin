import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Role } from "../core/types/user";

interface ProtectedRouteProps {
  /** Roles allowed in. Omit to allow any logged-in user. */
  roles?: Role[];
  /** Shown to logged-in users whose role is not allowed. */
  deniedMessage?: string;
}

/**
 * Route guard for the SPA. UX only: it decides what to *show*.
 * The real protection is the API (JwtAuthGuard + RolesGuard), because
 * anyone can change the JS running in their own browser.
 */
export default function ProtectedRoute({
  roles,
  deniedMessage = "A tua conta não tem acesso a esta página.",
}: ProtectedRouteProps) {
  const { state, retry } = useCurrentUser();
  const location = useLocation();

  if (state.status === "loading") {
    return <p style={{ textAlign: "center" }}>A carregar...</p>;
  }

  if (state.status === "error") {
    return (
      <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
        <p>Não foi possível ligar ao servidor.</p>
        <button onClick={retry} style={{ padding: "10px" }}>
          Tentar outra vez
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
        <h2>Sem permissão</h2>
        <p>{deniedMessage}</p>
        <Link to="/">Ir para o meu início</Link>
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
