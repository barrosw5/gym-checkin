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
      <p>
        Olá, {user.name}. Aqui vão aparecer o QR do ecrã e os pedidos
        pendentes.
      </p>
      <Link to="/dashboard">Voltar ao início</Link>
    </div>
  );
}
