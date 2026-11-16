import { useAuthenticatedUser } from "./useCurrentUser";

/** Student home: the user is already loaded and checked by ProtectedRoute. */
export const useDashboard = () => {
  const user = useAuthenticatedUser();
  return { user };
};
