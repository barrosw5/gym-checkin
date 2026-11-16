import { usePendingRequests } from "../hooks/usePendingRequests";

const timeFormat = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Reception panel: who is asking to enter, oldest first. */
export default function PendingRequests() {
  const { requests, stale, busyId, message, decide } = usePendingRequests();

  return (
    <section aria-labelledby="pending-title" style={{ margin: "30px 0" }}>
      <h2 id="pending-title">Pedidos de entrada</h2>

      {requests === null && <p>A carregar...</p>}
      {requests?.length === 0 && <p>Sem pedidos pendentes.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {requests?.map((r) => (
          <li
            key={r.id}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
              padding: "12px 0",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span style={{ flex: "1 1 200px" }}>
              <strong>{r.name}</strong> · Quarto {r.room}
              <br />
              <small>Pedido às {timeFormat.format(r.createdAt)}</small>
            </span>
            <button
              onClick={() => decide(r.id, "approve")}
              disabled={busyId === r.id}
              style={{
                padding: "10px 16px",
                backgroundColor: "#38a169",
                color: "white",
                border: "none",
              }}
            >
              Aceitar
            </button>
            <button
              onClick={() => decide(r.id, "reject")}
              disabled={busyId === r.id}
              style={{
                padding: "10px 16px",
                backgroundColor: "#e53e3e",
                color: "white",
                border: "none",
              }}
            >
              Rejeitar
            </button>
          </li>
        ))}
      </ul>

      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {message}
        </p>
      )}
      {stale && (
        <p style={{ color: "#718096" }}>Sem ligação, a tentar reconectar...</p>
      )}
    </section>
  );
}
