import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";
import { toTranslatable, type Translatable } from "../core/i18n/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Translatable | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(username, password);
      // Back to the page ProtectedRoute sent us away from, if any
      const from = (location.state as { from?: unknown } | null)?.from;
      // Only internal paths: never redirect to another site (open redirect)
      const target =
        typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
          ? from
          : "/"; // RoleHome sends each role to its own page
      navigate(target, { replace: true });
    } catch (err) {
      setError(toTranslatable(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return { login, logout, loading, error };
};
