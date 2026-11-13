import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      await authService.login(username, password);
      // Back to the page ProtectedRoute sent us away from, if any
      const from = (location.state as { from?: unknown } | null)?.from;
      // Only internal paths: never redirect to another site (open redirect)
      const target =
        typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
          ? from
          : "/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
