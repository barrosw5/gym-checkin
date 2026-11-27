import { useQrCheckin } from "../hooks/useQrCheckin";
import CheckinButton from "./CheckinButton";
import QrCheckinView from "./QrCheckinView";
import Page from "./ui/Page";

/** The QR link page: connects the hook (API) to the view. */
export default function QrCheckin() {
  const { state } = useQrCheckin();

  return (
    <Page>
      {/* Scanning on the way out: offer to leave right here */}
      <QrCheckinView state={state} alreadyIn={<CheckinButton />} />
    </Page>
  );
}
