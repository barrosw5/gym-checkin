import { WifiOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import { ICON } from "./ui/icon";

export interface ReceptionScreenViewProps {
  /** null while the first token loads. */
  qrUrl: string | null;
  /** The token could not be refreshed: the last QR stays (still valid briefly). */
  stale: boolean;
  /** The live occupancy block, under the plaque. */
  occupancy: ReactNode;
}

/**
 * Full screen for the reception PC/tablet, facing students. The second
 * moment: the QR set in a navy ring like the crest, with a gold caption.
 */
export default function ReceptionScreenView({ qrUrl, stale, occupancy }: ReceptionScreenViewProps) {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-8 text-center">
      {/* No PageLayout here (full screen), so the tab title is set here */}
      <title>{t("layout.documentTitle", { page: t("receptionScreen.title") })}</title>
      {/* Staff picks the language the screen shows to students */}
      <div className="absolute top-4 right-4">
        <LanguagePicker />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-medium text-slate-900 sm:text-5xl">{t("receptionScreen.title")}</h1>
        <p className="text-lg text-slate-600">{t("receptionScreen.instruction")}</p>
      </div>

      {/* The plaque: navy ring, white field, gold caption */}
      <figure className="flex flex-col items-center gap-3 rounded-[32px] bg-navy-700 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:p-4">
        <div className="rounded-[20px] bg-white p-3 sm:p-4">
          {qrUrl ? (
            <QRCodeSVG
              value={qrUrl}
              // Black on white with a quiet zone: inverted or tinted codes fail on many phones
              bgColor="#ffffff"
              fgColor="#000000"
              marginSize={2}
              title={t("receptionScreen.qrTitle")}
              size={512}
              // Fits any screen, portrait or landscape (the SVG scales cleanly)
              style={{ width: "min(70vw, 52vh)", height: "auto" }}
            />
          ) : (
            <div className="grid aspect-square w-[min(70vw,52vh)] place-items-center text-slate-500">
              {t("receptionScreen.generating")}
            </div>
          )}
        </div>
        <figcaption className="pb-1 text-sm font-medium text-gold-300">{t("receptionScreen.caption")}</figcaption>
      </figure>

      {stale && (
        <p role="alert" className="flex items-center gap-2 text-sm font-medium text-red-700">
          <WifiOff {...ICON} />
          {t("receptionScreen.offline")}
        </p>
      )}

      <div className="w-full max-w-sm text-left">{occupancy}</div>
    </main>
  );
}
