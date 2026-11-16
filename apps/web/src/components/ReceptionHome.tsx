import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";

/** Placeholder for the reception panel (Phase 3/4): proves the role guard. */
export default function ReceptionHome() {
  const user = useAuthenticatedUser();

  return (
    <div
      style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "sans-serif" }}
    >
      <h1>Painel da receção</h1>
      <p>Olá, {user.name}.</p>
      <p>
        {/* New tab: the screen stays open full screen on the reception PC */}
        <Link to="/reception/screen" target="_blank">
          Abrir o ecrã do QR
        </Link>
      </p>
      <Link to="/dashboard">Voltar ao início</Link>
    </div>
  );
}
