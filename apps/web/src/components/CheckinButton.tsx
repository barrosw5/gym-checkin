import { useCheckin } from "../hooks/useCheckin";
import CheckinPanelView from "./CheckinPanelView";

/** Enter / leave the gym: connects the hook (API) to the view. */
export default function CheckinButton() {
  const { state, busy, message, reload, requestEntry, leave } = useCheckin();

  return (
    <CheckinPanelView
      state={state}
      busy={busy}
      message={message}
      onReload={reload}
      onRequestEntry={requestEntry}
      onLeave={leave}
    />
  );
}
