import { usePendingRequests } from "../hooks/usePendingRequests";
import PendingRequestsView from "./PendingRequestsView";

/** Live entry requests: connects the hook (SSE) to the view. */
export default function PendingRequests() {
  const { requests, stale, busyId, message, decide } = usePendingRequests();
  return <PendingRequestsView requests={requests} stale={stale} busyId={busyId} message={message} onDecide={decide} />;
}
