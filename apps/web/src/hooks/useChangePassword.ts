import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";
import { useAuthenticatedUser } from "./useCurrentUser";
import { toTranslatable, type Translatable } from "../core/i18n/types";

export const useChangePassword = () => {
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Translatable | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (currentPassword: string, newPassword: string) => {
    setBusy(true);
    setError(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setDone(true);
    } catch (err) {
      setError(toTranslatable(err));
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
