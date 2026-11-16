import { Navigate } from "react-router-dom";
import { useRoleHome } from "../hooks/useRoleHome";

/** "/" sends each role to its own home: students train, staff run the gym. */
export default function RoleHome() {
  return <Navigate to={useRoleHome()} replace />;
}
