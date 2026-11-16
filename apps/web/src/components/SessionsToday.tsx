import { useSessionsToday } from "../hooks/useSessionsToday";
import SessionsTodayView from "./SessionsTodayView";

/** Today's sessions: connects the hook (API, refreshed by occupancy changes) to the view. */
export default function SessionsToday() {
  const { sessions, failed, busyId, message, reload, closeNow, correctTimes } = useSessionsToday();

  return (
    <SessionsTodayView
      sessions={sessions}
      failed={failed}
      busyId={busyId}
      message={message}
      onReload={reload}
      onCloseNow={closeNow}
      onCorrect={correctTimes}
    />
  );
}
