import { Dumbbell, WifiOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import { ICON } from "./ui/icon";

export interface ReceptionScreenViewProps {
  /** null while the first token loads. */
  qrUrl: string | null;
  /** Time left for the code on screen; null while loading. */
  countdown: { secondsLeft: number; windowSeconds: number } | null;
  /** The token could not be refreshed: the last QR stays (still valid briefly). */
  stale: boolean;
  /** The live occupancy block. */
  occupancy: ReactNode;
}

const STEPS = ["receptionScreen.step1", "receptionScreen.step2", "receptionScreen.step3"] as const;

/** The QR fills the screen's smaller side, in portrait or landscape. */
const QR_SIZE = "w-[min(72vw,43svh)] lg:w-[min(36vw,58svh)]";

/**
 * Full screen for the reception PC/tablet, facing students: a graphite poster
 * in both themes (it is signage). How to enter and how full the gym is on one
 * side, the code on the other.
 */
export default function ReceptionScreenView({ qrUrl, countdown, stale, occupancy }: ReceptionScreenViewProps) {
  const { t } = useTranslation();

  return (
    <main data-theme="dark" className="flex min-h-svh flex-col gap-6 bg-canvas p-5 text-ink sm:p-8 lg:p-10">
      {/* No PageLayout here (full screen), so the tab title is set here */}
      <title>{t("layout.documentTitle", { page: t("receptionScreen.title") })}</title>

      <div className="flex items-center justify-between gap-4">
        {/* Not a link: this screen faces students, the desk does not */}
        <p className="flex items-center gap-2.5 text-[15px] font-semibold">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">
            <Dumbbell {...ICON} />
          </span>
          {t("layout.appName")}
        </p>
        {/* Staff picks the language the screen shows to students */}
        <LanguagePicker />
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 content-center items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="flex flex-col gap-6 lg:gap-10">
          <div className="flex flex-col gap-4 lg:gap-6">
            <h1 className="text-4xl leading-tight font-medium tracking-tight text-balance lg:text-6xl">
              {t("receptionScreen.title")}
            </h1>
            <ol className="flex flex-col gap-3 text-lg text-ink-2 lg:text-2xl">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-4">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-base font-semibold text-accent-ink tabular-nums">
                    {i + 1}
                  </span>
                  {t(step)}
                </li>
              ))}
            </ol>
          </div>
          {/* After the code when everything is stacked */}
          <div className="hidden lg:block">{occupancy}</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Lime frame, white field: scanners need black on white */}
          <figure className="flex flex-col items-center gap-3 rounded-[32px] bg-accent p-3 sm:p-4">
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
                  className={`h-auto ${QR_SIZE}`}
                />
              ) : (
                <div className={`grid aspect-square place-items-center text-center text-neutral-600 ${QR_SIZE}`}>
                  {t("receptionScreen.generating")}
                </div>
              )}
            </div>
            <figcaption className="pb-1 text-sm font-semibold text-on-accent">{t("receptionScreen.caption")}</figcaption>
          </figure>

          {stale ? (
            <p role="alert" className="flex items-center gap-2 font-medium text-danger">
              <WifiOff {...ICON} />
              {t("receptionScreen.offline")}
            </p>
          ) : (
            countdown && (
              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-sm text-ink-2 tabular-nums">
                  {t("receptionScreen.changesIn", { seconds: countdown.secondsLeft })}
                </p>
                <div aria-hidden="true" className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-raised">
                  {/* scaleX instead of width: animates on the GPU, never re-lays out */}
                  <div
                    className="h-full origin-left bg-data transition-transform duration-1000 ease-linear"
                    style={{ transform: `scaleX(${countdown.secondsLeft / countdown.windowSeconds})` }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        <div className="mx-auto w-full max-w-md lg:hidden">{occupancy}</div>
      </div>
    </main>
  );
}
