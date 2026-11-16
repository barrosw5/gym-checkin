import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import AccountActions from "./AccountActions";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";

/** Reception panel (staff PC): requests, today's sessions, the QR screen. */
export default function ReceptionHome() {
  const user = useAuthenticatedUser();

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Painel da receção</h1>
      <p>Olá, {user.name}.</p>
      <p>
        {/* New tab: the screen stays open full screen on the reception PC */}
        <Link to="/reception/screen" target="_blank">
          Abrir o ecrã do QR
        </Link>
      </p>
      <OccupancyCounter />
      {/* Here, not on the QR screen: that one faces students (names, GDPR) */}
      <PendingRequests />
      <SessionsToday />
      <AccountActions />
    </main>
  );
}
