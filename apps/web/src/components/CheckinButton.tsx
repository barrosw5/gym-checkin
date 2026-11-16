import { useCheckin } from "../hooks/useCheckin";

const timeFormat = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function CheckinButton() {
  const { state, busy, message, toggle, reload } = useCheckin();

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

  const isIn = state.status === "in";

  return (
    <div style={{ margin: "30px 0" }}>
      <p>
        {isIn
          ? `Estás no ginásio desde as ${timeFormat.format(state.session.entryAt)}.`
          : "Não estás no ginásio."}
      </p>
      <button
        onClick={toggle}
        disabled={busy}
        style={{
          padding: "16px 32px",
          fontSize: "1.2rem",
          backgroundColor: isIn ? "#dd6b20" : "#38a169",
          color: "white",
          border: "none",
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Aguarda..." : isIn ? "Sair do ginásio" : "Entrar no ginásio"}
      </button>
      {/* role="alert": screen readers announce the message when it appears */}
      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {message}
        </p>
      )}
    </div>
  );
}
