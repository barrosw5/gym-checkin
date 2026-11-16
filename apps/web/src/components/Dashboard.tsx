import { useDashboard } from "../hooks/useDashboard";
import CheckinButton from "./CheckinButton";
import AccountActions from "./AccountActions";
import OccupancyCounter from "./OccupancyCounter";

/** Student home: how full the gym is, and the way in/out. */
export default function Dashboard() {
  const { user } = useDashboard();

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "0 16px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Bem-vindo, {user.name}!</h1>
      <p>
        <strong>Quarto:</strong> {user.room}
      </p>

      <OccupancyCounter />
      <CheckinButton />
      <AccountActions />
    </div>
  );
}
