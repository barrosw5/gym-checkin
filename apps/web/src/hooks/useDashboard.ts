import { useAuth } from "./useAuth";
import { useAuthenticatedUser } from "./useCurrentUser";

export const useDashboard = () => {
  // Already loaded and checked by ProtectedRoute: no fetch, no redirect here
  const user = useAuthenticatedUser();
  const { logout } = useAuth(); // Reusing the logout function from useAuth
  const isStaff = user.role === "RECEPTION" || user.role === "ADMIN";

  return { user, isStaff, logout };
};
