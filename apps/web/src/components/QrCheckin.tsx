import { Link } from "react-router-dom";
import { useQrCheckin } from "../hooks/useQrCheckin";
import CheckinButton from "./CheckinButton";

const timeFormat = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Landing page of the reception QR (/c/<token>), built for phones. */
export default function QrCheckin() {
  const { state } = useQrCheckin();

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "40px 16px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      {state.status === "working" && <p>A registar a tua entrada...</p>}

      {state.status === "checked-in" && (
        // role="status": screen readers announce the result
        <div role="status">
          <p style={{ fontSize: "4rem", margin: 0 }} aria-hidden="true">
            ✅
          </p>
          <h1>Entraste no ginásio</h1>
          <p>Às {timeFormat.format(state.session.entryAt)}. Bom treino!</p>
          <p>Quando saíres, carrega em "Sair do ginásio" no início.</p>
        </div>
      )}

      {state.status === "already-in" && (
        <div>
          <h1>Já estavas no ginásio</h1>
          {/* Scanning on the way out: offer to leave right here */}
          <CheckinButton />
        </div>
      )}

      {state.status === "error" && (
        <div role="alert">
          <h1>Não foi possível entrar</h1>
          <p>{state.message}</p>
        </div>
      )}

      {state.status !== "working" && <Link to="/dashboard">Ir para o início</Link>}
    </main>
  );
}
