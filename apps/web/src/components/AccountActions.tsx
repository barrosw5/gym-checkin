import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import LogoutButton from "./LogoutButton";

/** Bottom of every home page: change password (not for demo accounts) and log out. */
export default function AccountActions() {
  const user = useAuthenticatedUser();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
      {!user.isDemo && (
        <Link to="/password" style={{ marginTop: "20px" }}>
          Mudar password
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}
