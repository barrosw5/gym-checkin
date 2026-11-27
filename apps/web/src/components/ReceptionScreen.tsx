import { useReceptionScreen } from "../hooks/useReceptionScreen";
import OccupancyCounter from "./OccupancyCounter";
import ReceptionScreenView from "./ReceptionScreenView";

/** The QR screen: connects the hook (token polling) to the view. */
export default function ReceptionScreen() {
  const screen = useReceptionScreen();
  return <ReceptionScreenView {...screen} occupancy={<OccupancyCounter large />} />;
}
