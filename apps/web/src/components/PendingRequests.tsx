import { formatTimeWithSeconds } from "../core/utils/format";
import { usePendingRequests } from "../hooks/usePendingRequests";
import { useTranslation } from "../hooks/useTranslation";

/** Reception panel: who is asking to enter, oldest first. */
export default function PendingRequests() {
  const { requests, stale, busyId, message, decide } = usePendingRequests();
  const { t, tm, languageTag } = useTranslation();

  return (
    <section aria-labelledby="pending-title" style={{ margin: "30px 0" }}>
      <h2 id="pending-title">{t("requests.title")}</h2>

      {requests === null && <p>{t("common.loading")}</p>}
      {requests?.length === 0 && <p>{t("requests.none")}</p>}

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
              <strong>{r.name}</strong> · {t("common.room", { room: r.room })}
              <br />
              <small>{t("requests.requestedAt", { time: formatTimeWithSeconds(r.createdAt, languageTag) })}</small>
            </span>
            <button
              onClick={() => decide(r.id, "approve")}
              disabled={busyId === r.id}
              style={{ padding: "10px 16px", backgroundColor: "#38a169", color: "white", border: "none" }}
            >
              {t("requests.accept")}
            </button>
            <button
              onClick={() => decide(r.id, "reject")}
              disabled={busyId === r.id}
              style={{ padding: "10px 16px", backgroundColor: "#e53e3e", color: "white", border: "none" }}
            >
              {t("requests.reject")}
            </button>
          </li>
        ))}
      </ul>

      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {tm(message)}
        </p>
      )}
      {stale && <p style={{ color: "#718096" }}>{t("common.reconnecting")}</p>}
    </section>
  );
}
