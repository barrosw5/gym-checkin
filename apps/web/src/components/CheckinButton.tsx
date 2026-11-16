import type { CSSProperties } from "react";
import { useCheckin } from "../hooks/useCheckin";

const timeFormat = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

const buttonStyle = (color: string, busy: boolean): CSSProperties => ({
  padding: "16px 32px",
  fontSize: "1.2rem",
  backgroundColor: color,
  color: "white",
  border: "none",
  cursor: busy ? "wait" : "pointer",
});

export default function CheckinButton() {
  const { state, busy, message, reload, enter, requestEntry, leave } =
    useCheckin();

  if (state.status === "loading") {
    return <p>A verificar se estás no ginásio...</p>;
  }

  if (state.status === "error") {
    return (
      <div>
        <p>Não foi possível saber se estás no ginásio.</p>
        <button onClick={reload} style={{ padding: "10px" }}>
          Tentar outra vez
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: "30px 0" }}>
      {state.status === "in" && (
        <>
          <p>
            Estás no ginásio desde as{" "}
            {timeFormat.format(state.session.entryAt)}.
          </p>
          <button
            onClick={leave}
            disabled={busy}
            style={buttonStyle("#dd6b20", busy)}
          >
            {busy ? "Aguarda..." : "Sair do ginásio"}
          </button>
        </>
      )}

      {state.status === "waiting" && (
        // role="status": screen readers announce it without stealing focus
        <p role="status">⏳ À espera que a receção aceite o teu pedido...</p>
      )}

      {state.status === "out" && (
        <>
          <p>Não estás no ginásio.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {state.methods.includes("RECEPTION_APPROVAL") && (
              <button
                onClick={requestEntry}
                disabled={busy}
                style={buttonStyle("#3182ce", busy)}
              >
                {busy ? "Aguarda..." : "Pedir entrada à receção"}
              </button>
            )}
            {state.methods.includes("SIMPLE") && (
              <button
                onClick={enter}
                disabled={busy}
                style={buttonStyle("#38a169", busy)}
              >
                {busy ? "Aguarda..." : "Entrar no ginásio"}
              </button>
            )}
          </div>
          {state.methods.includes("SCREEN_QR") && (
            <p>Também podes ler o QR no ecrã da receção.</p>
          )}
        </>
      )}

      {/* role="alert": screen readers announce the message when it appears */}
      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {message}
        </p>
      )}
    </div>
  );
}
