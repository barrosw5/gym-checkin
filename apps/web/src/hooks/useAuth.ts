import type { DemoRole } from "@gym-checkin/shared";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";
import { demoService } from "../core/services/demoService";
import { toTranslatable, type Translatable } from "../core/i18n/types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Translatable | null>(null);
  // Which demo button was pressed (null: none is in progress)
  const [demoRole, setDemoRole] = useState<DemoRole | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const goToTarget = () => {
    // Back to the page ProtectedRoute sent us away from, if any
    const from = (location.state as { from?: unknown } | null)?.from;
    // Only internal paths: never redirect to another site (open redirect)
    const target =
      typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        ? from
        : "/"; // RoleHome sends each role to its own page
    navigate(target, { replace: true });
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(username, password);
      goToTarget();
    } catch (err) {
      setError(toTranslatable(err));
    } finally {
      setLoading(false);
    }
  };

  /** One click into a public demo account (only offered in demo mode). */
  const loginDemo = async (role: DemoRole) => {
    setDemoRole(role);
    setError(null);
    try {
      await demoService.login(role);
      goToTarget();
    } catch (err) {
      setError(toTranslatable(err));
    } finally {
      setDemoRole(null);
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

  return { login, loginDemo, logout, loading, demoRole, error };
};
