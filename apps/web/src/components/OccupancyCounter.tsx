import { useOccupancy } from "../hooks/useOccupancy";

export default function OccupancyCounter() {
  const { occupancy, stale } = useOccupancy();

  if (!occupancy) {
    return <p>A carregar a ocupação...</p>;
  }

  return (
    // aria-live: screen readers announce the new count when it changes
    <section aria-live="polite" style={{ margin: "30px 0" }}>
      <p style={{ margin: 0 }}>Pessoas no ginásio agora</p>
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
      {occupancy.isFull && <p style={{ margin: 0 }}>O ginásio está cheio.</p>}
      {stale && (
        <p style={{ margin: 0, color: "#718096" }}>
          Sem ligação, a tentar reconectar...
        </p>
      )}
    </section>
  );
}
