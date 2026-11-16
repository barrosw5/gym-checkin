import { useReceptionScreen } from "../hooks/useReceptionScreen";
import OccupancyCounter from "./OccupancyCounter";
import ReceptionScreenView from "./ReceptionScreenView";

/** The QR screen: connects the hook (token polling) to the view. */
export default function ReceptionScreen() {
  const { qrUrl, stale } = useReceptionScreen();
  return <ReceptionScreenView qrUrl={qrUrl} stale={stale} occupancy={<OccupancyCounter />} />;
}
