import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { authService } from "../core/services/authService";
import type { User } from "../core/types/user";

type CurrentUserState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "error" };

/**
 * Asks the API who is logged in. The cookie is httpOnly, so JS cannot read it:
 * GET /auth/me is the only way to know whether the session is valid.
 */
export const useCurrentUser = () => {
  const [state, setState] = useState<CurrentUserState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore the answer if the component unmounted or retried meanwhile
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setState(
          user
            ? { status: "authenticated", user }
            : { status: "unauthenticated" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
};

/**
 * The user loaded by ProtectedRoute, for any page rendered inside it.
 * Avoids a second GET /auth/me per page.
 */
export const useAuthenticatedUser = () => useOutletContext<User>();
