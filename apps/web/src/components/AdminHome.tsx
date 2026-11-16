import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import LogoutButton from "./LogoutButton";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";
import UsersAdmin from "./UsersAdmin";

/** Admin panel: everything reception does, plus accounts. No check-in. */
export default function AdminHome() {
  const user = useAuthenticatedUser();

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Painel de administração</h1>
      <p>Olá, {user.name}.</p>
      <p>
        {/* New tab: the screen stays open full screen on the reception PC */}
        <Link to="/reception/screen" target="_blank">
          Abrir o ecrã do QR
        </Link>
      </p>
      <OccupancyCounter />
      <PendingRequests />
      <SessionsToday />
      <UsersAdmin />
      <LogoutButton />
    </main>
  );
}
