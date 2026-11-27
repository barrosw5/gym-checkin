import { ExternalLink, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

/** Staff desk: opens the full-screen QR page in a new tab (for the screen students face). */
export default function QrScreenLink() {
  const { t } = useTranslation();

  return (
    <Card>
      <Link
        to="/reception/screen"
        // New tab: the screen stays open full screen on the reception PC
        target="_blank"
        className="group flex items-center gap-3 rounded-lg"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <QrCode {...ICON} />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-1.5 font-medium text-accent-ink group-hover:text-ink">
            {t("common.openQrScreen")}
            <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="block text-sm text-ink-3">{t("reception.qrScreenHint")}</span>
        </span>
      </Link>
    </Card>
  );
}
