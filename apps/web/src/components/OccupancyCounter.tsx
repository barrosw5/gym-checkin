import { useOccupancy } from "../hooks/useOccupancy";
import { useTranslation } from "../hooks/useTranslation";

export default function OccupancyCounter() {
  const { occupancy, stale } = useOccupancy();
  const { t } = useTranslation();

  if (!occupancy) {
    return <p>{t("occupancy.loading")}</p>;
  }

  return (
    // aria-live: screen readers announce the new count when it changes
    <section aria-live="polite" style={{ margin: "30px 0" }}>
      <p style={{ margin: 0 }}>{t("occupancy.label")}</p>
      <p
        style={{
          margin: "4px 0",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: occupancy.isFull ? "#c53030" : "#2f855a",
        }}
      >
        {occupancy.count}/{occupancy.capacity}
      </p>
      {occupancy.isFull && <p style={{ margin: 0 }}>{t("occupancy.full")}</p>}
      {stale && <p style={{ margin: 0, color: "#718096" }}>{t("common.reconnecting")}</p>}
    </section>
  );
}
