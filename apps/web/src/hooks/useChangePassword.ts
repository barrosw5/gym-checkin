import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";
import { useAuthenticatedUser } from "./useCurrentUser";

export const useChangePassword = () => {
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (currentPassword: string, newPassword: string) => {
    setBusy(true);
    setError("");
    try {
      await authService.changePassword(currentPassword, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  };

  return {
    /** Forced change (temporary password): no way back until it is done. */
    forced: user.mustChangePassword,
    isDemo: user.isDemo,
    busy,
    error,
    done,
    submit,
    // "/" re-reads the user and picks the home page for their role
    goHome: () => navigate("/", { replace: true }),
  };
};
