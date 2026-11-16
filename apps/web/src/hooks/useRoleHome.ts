import { homePathFor } from "../core/services/authService";
import { useAuthenticatedUser } from "./useCurrentUser";

/** Where "/" sends the logged-in user (each role has its own home). */
export const useRoleHome = () => homePathFor(useAuthenticatedUser().role);
