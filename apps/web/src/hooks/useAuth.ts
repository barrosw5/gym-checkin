import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      await authService.login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return { login, logout, loading, error };
};
