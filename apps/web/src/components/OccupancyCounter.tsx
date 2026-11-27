import { useOccupancy } from "../hooks/useOccupancy";
import OccupancyCounterView from "./OccupancyCounterView";

/** Live occupancy: connects the hook (SSE) to the view. */
export default function OccupancyCounter({ large }: { large?: boolean }) {
  return <OccupancyCounterView {...useOccupancy()} large={large} />;
}
