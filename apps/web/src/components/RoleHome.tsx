import { Navigate } from "react-router-dom";
import { homePathFor } from "../core/services/authService";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";

/** "/" sends each role to its own home: students train, staff run the gym. */
export default function RoleHome() {
  const user = useAuthenticatedUser();
  return <Navigate to={homePathFor(user.role)} replace />;
}
