import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../core/services/authService";
import { useAuth } from "./useAuth";
import type { User } from "../core/types/user";

export const useDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth(); // Reusing the logout function from useAuth

  useEffect(() => {
    // Fetch user profile on mount
    authService
      .getProfile()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        // If not authenticated, kick to login
        navigate("/login");
      });
  }, [navigate]);

  return { user, loading, logout };
};
